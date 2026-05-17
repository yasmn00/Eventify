import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  
  // SeatSelection'dan gelen verileri güvenle karşılıyoruz
  const secilenBiletler = location.state?.biletler || [];
  const koltukToplami = location.state?.toplamTutar || 0; 
  const eventName = location.state?.eventName || "Seçilen Etkinlik"; // Etkinlik adı yakalandı

  // Çakışma yaratan mükerrer "cartItems" satırı kaldırıldı!
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [installment, setInstallment] = useState('1');
  const [formErrors, setFormErrors] = useState({});

  // Genel toplam direkt koltuk seçiminden gelen dinamik tutar oluyor
  const genelToplam = koltukToplami; 
  const formattedCardNumber = cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');

  // Sıra harfine göre dinamik bilet fiyatını belirleyen yardımcı fonksiyon
  const getSeatPrice = (seatId) => {
    const row = seatId.charAt(0);
    if (row === 'A') return 600;
    if (['K', 'L', 'M'].includes(row)) return 450;
    return 500;
  };

  const handleCardNumberChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(onlyDigits);
  };

  const handleCardHolderChange = (e) => {
    const normalizedValue = e.target.value
      .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '')
      .replace(/\s+/g, ' ')
      .trimStart();
    setCardHolder(normalizedValue);
  };

  const handleExpiryDateChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 4);
    let formattedValue = onlyDigits;

    if (onlyDigits.length > 2) {
      formattedValue = `${onlyDigits.slice(0, 2)}/${onlyDigits.slice(2)}`;
    }

    setExpiryDate(formattedValue);
  };

  const handleCvcChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvc(onlyDigits);
  };

  const validatePaymentForm = () => {
    const errors = {};
    const cleanedCardHolder = cardHolder.trim();
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (cardNumber.length !== 16) {
      errors.cardNumber = 'Kart numarası 16 haneli olmalıdır.';
    }

    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ]+(?:\s+[a-zA-ZğüşıöçĞÜŞİÖÇ]+)+$/.test(cleanedCardHolder)) {
      errors.cardHolder = 'Ad Soyad en az iki kelime olmalıdır.';
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      errors.expiryDate = 'Son kullanma tarihi MM/YY formatında olmalıdır.';
    } else {
      const [monthPart, yearPart] = expiryDate.split('/');
      const month = Number(monthPart);
      const year = Number(yearPart);

      if (month < 1 || month > 12) {
        errors.expiryDate = 'Ay değeri 01 ile 12 arasında olmalıdır.';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Kartın son kullanma tarihi geçmiş olamaz.';
      }
    }

    if (!/^\d{3}$/.test(cvc)) {
      errors.cvc = 'CVC 3 haneli olmalıdır.';
    }

    const installmentNumber = Number(installment);
    if (installmentNumber < 1 || installmentNumber > 6) {
      errors.installment = 'Taksit seçimi 1 ile 6 arasında olmalıdır.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) {
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Sipariş oluşturmak için lütfen önce giriş yapın.");
      return;
    }

    try {
      // Biletleri her bir koltuğun kendi gerçek fiyatıyla listeliyoruz
      const orderItems = secilenBiletler.map(koltukNo => ({
        type: 'ticket',
        name: `${eventName} - Koltuk: ${koltukNo}`,
        price: getSeatPrice(koltukNo),
        quantity: 1
      }));

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        totalPrice: genelToplam,
        installment: installment,
        status: "Sipariş Alındı",
        createdAt: serverTimestamp(),
        items: orderItems
      };

      await addDoc(collection(db, "orders"), orderData);

      alert(`${genelToplam.toFixed(2)}₺ tutarındaki siparişiniz başarılı şekilde oluşturuldu! Siparişlerim sayfasına yönlendiriliyorsunuz.`);
      
      navigate('/private', { state: { activeTab: 'orders' } });
    } catch (error) {
      console.error("Sipariş veritabanına kaydedilirken hata oluştu: ", error);
      alert("Ödeme alındı fakat sipariş kaydı oluşturulamadı. Lütfen destekle iletişime geçin.");
    }
  };

  return (
    <div className="min-h-screen py-20 bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-20 px-4">
        <h1 className="text-3xl font-bold mb-8">Sepetim</h1>

        {secilenBiletler.length === 0 ? (
          <p className="text-center text-gray-600">Sepetiniz boş. Lütfen önce etkinlik detayından koltuk seçin.</p>
        ) : (
          <>
            <ul className="space-y-6">
              {secilenBiletler.map((koltukNo) => {
                const biletFiyati = getSeatPrice(koltukNo);
                return (
                  <li key={koltukNo} className="bg-blue-50 p-4 rounded border border-blue-200 shadow flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-blue-800">{eventName}</h2>
                      <p className="text-blue-600">{koltukNo} Numaralı Koltuk Giriş Bileti</p>
                    </div>
                    <span className="font-bold text-lg text-blue-800">{biletFiyati}.00₺</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex justify-end items-center space-x-6 bg-white p-6 rounded-lg shadow-md">
              <span className="text-xl font-bold">Genel Toplam:</span>
              <span className="text-3xl font-extrabold text-blue-600">{genelToplam.toFixed(2)}₺</span>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
              <label className="block mb-2 text-sm font-medium">Ödeme Yöntemi</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="credit">Kredi Kartı</option>
              </select>
            </div>

            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h2 className="text-lg font-semibold">Kredi Kartı Bilgileri</h2>

              <div>
                <label className="block mb-2 text-sm font-medium">Kart Numarası</label>
                <input
                  type="text"
                  value={formattedCardNumber}
                  onChange={handleCardNumberChange}
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {formErrors.cardNumber && <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Ad Soyad</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={handleCardHolderChange}
                  placeholder="Kart üzerindeki ad soyad"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {formErrors.cardHolder && <p className="text-red-500 text-sm mt-1">{formErrors.cardHolder}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Son Kullanma (MM/YY)</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="AA/YY"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {formErrors.expiryDate && <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={handleCvcChange}
                    inputMode="numeric"
                    maxLength={3}
                    placeholder="3 haneli CVC"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {formErrors.cvc && <p className="text-red-500 text-sm mt-1">{formErrors.cvc}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Taksit</label>
                  <select
                    value={installment}
                    onChange={(e) => setInstallment(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="1">1 Taksit</option>
                    <option value="2">2 Taksit</option>
                    <option value="3">3 Taksit</option>
                    <option value="4">4 Taksit</option>
                    <option value="5">5 Taksit</option>
                    <option value="6">6 Taksit</option>
                  </select>
                  {formErrors.installment && <p className="text-red-500 text-sm mt-1">{formErrors.installment}</p>}
                </div>
              </div>
            </div>

            <button
              className="mt-6 w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all"
              onClick={handlePayment}
            >
              Siparişi Ver ({genelToplam.toFixed(2)}₺)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
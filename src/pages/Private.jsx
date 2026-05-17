import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, doc, getDoc, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore'; // onSnapshot ve orderBy eklendi
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';

const Private = () => {
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorites'); 

  const FIRESTORE_FAVORITES_BLOCKED_KEY = 'firestore_favorites_blocked';
  const getLocalFavorites = (uid) => {
    const key = `favorites_${uid}`;
    return JSON.parse(localStorage.getItem(key)) || [];
  };

  useEffect(() => {
    let unsubscribeOrders = () => {}; 

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (!user) {
        setFavorites([]);
        setOrders([]);
        setLoading(false);
        return;
      }

      
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc") 
        );

        unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
          const ordersList = [];
          querySnapshot.forEach((doc) => {
            ordersList.push({ id: doc.id, ...doc.data() });
          });
          setOrders(ordersList);
        }, (error) => {
          console.error("Siparişler canlı dinlenirken hata oluştu:", error);
          if(error.code === 'failed-precondition') {
             console.warn("Lütfen konsoldaki linke tıklayarak index oluşturun.");
          }
        });
      } catch (err) {
        console.error("Siparişler sorgulanamadı:", err);
      }

      // FAVORİLERİ ÇEKME 
      const mergedFavorites = new Map();
      const pushFavorites = (items, source) => {
        items.forEach((fav, index) => {
          const eventId = fav.eventId || fav.id || `${source}-${index}`;
          if (!mergedFavorites.has(eventId)) {
            mergedFavorites.set(eventId, {
              id: eventId,
              ...fav
            });
          }
        });
      };

      try {
        const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const cloudFavorites = querySnapshot.docs.map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }));
        pushFavorites(cloudFavorites, 'cloud');
      } catch (error) {
        if (error.code === 'permission-denied') {
          localStorage.setItem(FIRESTORE_FAVORITES_BLOCKED_KEY, '1');
        } else {
          console.error("Favoriler çekilemedi:", error);
        }
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const profileFavorites = userDoc.data()?.favoriteEvents || [];
        pushFavorites(profileFavorites, 'profile');
      } catch (error) {
        if (error.code === 'permission-denied') {
          localStorage.setItem(FIRESTORE_FAVORITES_BLOCKED_KEY, '1');
        } else {
          console.error("Profil favorileri çekilemedi:", error);
        }
      }

      const localFavorites = getLocalFavorites(user.uid);
      pushFavorites(localFavorites, 'local');

      setFavorites(Array.from(mergedFavorites.values()));
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeOrders(); 
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Mavi Banner Alanı */}
      <div className="relative bg-blue-900 mt-28 text-white pt-12 pb-6 px-6 md:px-20 shadow-lg border-b-4 border-blue-600">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">⚙️ Hesabım</h1>
          <p className="text-lg opacity-80 mb-6">Profil detaylarını, favorilerini ve geçmiş siparişlerini buradan yönetebilirsin.</p>
          
          {/* SEKME BUTONLARI */}
          <div className="flex space-x-4 border-b border-blue-800">
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`pb-3 text-lg font-bold transition-all px-2 ${activeTab === 'favorites' ? 'border-b-4 border-white text-white' : 'text-blue-300 hover:text-white'}`}
            >
              ❤️ Favorilerim ({favorites.length})
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`pb-3 text-lg font-bold transition-all px-2 ${activeTab === 'orders' ? 'border-b-4 border-white text-white' : 'text-blue-300 hover:text-white'}`}
            >
              📦 Siparişlerim ({orders.length})
            </button>
          </div>
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <p className="text-center text-gray-500 text-lg font-medium">Yükleniyor...</p>
        ) : (
          <>
            {/* FAVORİLERİ LİSTELEME SEKMESİ */}
            {activeTab === 'favorites' && (
              favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <img src={fav.image} alt={fav.name} className="w-full h-48 object-cover" />
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-2">{fav.name}</h3>
                        <p className="text-blue-600 font-medium">📅 {fav.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 text-lg">Henüz favori etkinliğin yok. Keşfetmeye başla!</p>
                </div>
              )
            )}

            {/* SİPARİŞLERİ LİSTELEME SEKMESİ */}
            {activeTab === 'orders' && (
              orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Sipariş Header Bilgisi */}
                      <div className="bg-gray-100 px-6 py-4 flex justify-between items-center flex-wrap gap-2 border-b border-gray-200">
                        <div>
                          <span className="text-sm text-gray-500 font-medium">Sipariş ID:</span>
                          <span className="font-mono text-sm font-bold text-gray-800 ml-1">#{order.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                            {order.status || 'Sipariş Alındı'}
                          </span>
                        </div>
                      </div>

                      {/* Siparişe Ait Biletler/Ürünler */}
                      <div className="p-6">
                        <ul className="divide-y divide-gray-100">
                          {order.items?.map((item, index) => (
                            <li key={index} className="py-3 flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.quantity} adet x {item.price}₺</p>
                              </div>
                              <span className="font-bold text-gray-800">{(item.price * item.quantity).toFixed(2)}₺</span>
                            </li>
                          ))}
                        </ul>

                        {/* Toplam Bilgisi */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-sm text-gray-500">Taksit: {order.installment || '1'} Taksit</span>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 mr-2">Ödenen Toplam:</span>
                            <span className="text-2xl font-extrabold text-blue-600">{order.totalPrice?.toFixed(2)}₺</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 text-lg">Henüz geçmiş bir siparişiniz bulunmuyor.</p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Private;
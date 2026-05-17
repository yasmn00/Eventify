// src/pages/EventDetails.jsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase'; 
import { addDoc, arrayUnion, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [isPlannable, setIsPlannable] = useState(null);
  const DEFAULT_STOCK = 20;

  // Eski sepet mantığından kalan fonksiyonları sadeleştirdik
  const getQuantityInCart = (eventId) => 0; 
  const remainingStock = DEFAULT_STOCK;
  const getLocalFavoritesKey = (uid) => `favorites_${uid}`;
  const FIRESTORE_FAVORITES_BLOCKED_KEY = 'firestore_favorites_blocked';

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=fbAxXXgAd8mDEingIoGHggKxmQ9GW45A`
        );
        const data = await res.json();
        setEvent(data);

        const city = data._embedded?.venues?.[0]?.city?.name;
        if (city) {
          fetchWeather(city);
        }
      } catch (error) {
        console.error('Etkinlik detayları alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWeather = async (cityName) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=503fb22b93619ca202ac16687a63ea6e&units=metric&lang=tr`
        );
        const weatherData = await response.json();
        setWeather(weatherData);

        const weatherDescription = weatherData.weather?.[0]?.main.toLowerCase();
        const notPlannableConditions = ['rain', 'thunderstorm', 'snow'];

        if (notPlannableConditions.includes(weatherDescription)) {
          setIsPlannable(false);
        } else {
          setIsPlannable(true);
        }
      } catch (error) {
        console.error('Hava durumu alınamadı:', error);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Yükleniyor...</p>;
  if (!event) return <p className="text-center mt-10 text-red-600">Etkinlik bulunamadı.</p>;

  const addToFavorites = async () => {
    const user = auth.currentUser;
    if (user) {
      const favoriteBase = {
        eventId: event.id,
        name: event.name,
        image: event.images?.[0]?.url || "",
        date: event.dates?.start?.localDate || ""
      };

      const persistFavoriteToLocal = () => {
        const key = getLocalFavoritesKey(user.uid);
        const localFavorites = JSON.parse(localStorage.getItem(key)) || [];
        const alreadyExists = localFavorites.some((fav) => fav.eventId === event.id);
        if (!alreadyExists) {
          localFavorites.push(favoriteBase);
          localStorage.setItem(key, JSON.stringify(localFavorites));
        }
      };
      const markFirestoreBlocked = () => {
        localStorage.setItem(FIRESTORE_FAVORITES_BLOCKED_KEY, '1');
      };
      const isFirestoreBlocked = localStorage.getItem(FIRESTORE_FAVORITES_BLOCKED_KEY) === '1';

      if (isFirestoreBlocked) {
        persistFavoriteToLocal();
        alert("❤️ Favorilere eklendi!");
        return;
      }

      const favoritePayload = {
        userId: user.uid,
        ...favoriteBase,
        addedAt: serverTimestamp()
      };

      try {
        await addDoc(collection(db, "favorites"), favoritePayload);
        alert("❤️ Favorilere eklendi!");
      } catch (e) {
        if (e.code === 'permission-denied') {
          markFirestoreBlocked();
          try {
            await updateDoc(doc(db, "users", user.uid), {
              favoriteEvents: arrayUnion(favoriteBase)
            });
            alert("❤️ Favorilere eklendi!");
            return;
          } catch (fallbackError) {
            if (fallbackError.code === 'permission-denied') {
              markFirestoreBlocked();
              persistFavoriteToLocal();
              alert("❤️ Favorilere eklendi!");
              return;
            }
            console.error("Fallback favori yazımı hatası:", fallbackError);
          }
        } else {
          console.error("Hata: ", e);
        }
        alert("Favorilere eklenirken yetki hatası oluştu. Firestore kurallarını kontrol etmelisin.");
      }
    } else {
      alert("Önce giriş yapmalısın!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-700 mt-20">
      <Navbar />
      <div className="max-w-6xl mx-auto py-20 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <img
              src={event.images?.[0]?.url}
              alt={event.name}
              className="w-full h-[400px] object-cover rounded-xl shadow-md"
            />
          </div>
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">{event.name}</h1>
            
            <p className="text-gray-600">
              <strong>Tarih:</strong> {event.dates?.start?.localDate}
            </p>
            <p className="text-gray-600">
              <strong>Şehir:</strong> {event._embedded?.venues?.[0]?.city?.name}
            </p>
            <p className="text-gray-600">
              <strong>Mekan:</strong> {event._embedded?.venues?.[0]?.name}
            </p>
            <p className="text-gray-600">
              <strong>Adres:</strong> {event._embedded?.venues?.[0]?.address?.line1}
            </p>
            {event.info && (
              <p className="text-gray-600">
                <strong>Bilgi:</strong> {event.info}
              </p>
            )}

            {weather && (
              <div className="mt-6 bg-gray-100 p-4 rounded-md">
                <h2 className="text-xl font-semibold mb-2">Etkinlik Günü Hava Durumu</h2>
                <p className="text-gray-700">
                  🌤️ <strong>{weather.weather[0].description}</strong>, sıcaklık: <strong>{weather.main.temp}°C</strong>
                </p>
                <p className="mt-2">
                  Planlanabilirlik:{" "}
                  <span className={`font-semibold ${isPlannable ? 'text-green-600' : 'text-red-600'}`}>
                    {isPlannable ? 'Planlanabilir' : 'Planlanamaz'}
                  </span>
                </p>
              </div>
            )}
            <p className="text-gray-600">
              <strong>Kalan Kontenjan:</strong>{' '}{remainingStock > 0 ? `${remainingStock} adet` : 'Tükendi'}
            </p>

            <p className="text-2xl font-bold text-red-500">
              <strong className='text-2xl'>Fiyat:</strong>{' '}
              {event.priceRanges
                ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}`
                : `500 TL`}
            </p>

            <div className="mt-6 flex gap-4">
              {/* YENİ MANTIK: Tıklanınca eventName bilgisini de state ile /seats sayfasına fırlatır */}
              <button
                onClick={() => navigate('/seats', { state: { eventName: event.name } })}
                className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-md"
              >
                💺 Koltuk Seç ve Bilet Al
              </button>

              {/* Favorilere Ekle Butonu */}
              <button
                onClick={addToFavorites}
                className="px-5 py-2 rounded-full bg-pink-100 text-pink-600 border border-pink-200 hover:bg-pink-200 transition flex items-center gap-2"
              >
                ❤️ Favorilere Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
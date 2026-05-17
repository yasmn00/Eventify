import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; // Firebasebağlantısı
import { collection, getDocs } from 'firebase/firestore';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerData, setBannerData] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'banners'));
        if (!querySnapshot.empty) {
          const firstDoc = querySnapshot.docs[0];
          setBannerData(firstDoc.data());
        } else {
          console.warn('Banner koleksiyonu boş.');
        }
      } catch (err) {
        console.error('Banner verisi alınamadı:', err);
      }
    };

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const savedCity = localStorage.getItem('selectedCity');
        
        let url = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=TR&sort=relevance,desc&apikey=fbAxXXgAd8mDEingIoGHggKxmQ9GW45A`;

        if (savedCity && savedCity !== "Tumu") {
          url += `&city=${savedCity}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setEvents(data._embedded?.events || []);
      } catch (error) {
        console.error('Etkinlikler alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="relative bg-blue-900 mt-28 text-white py-16 px-6 md:px-20 shadow-lg border-b-4 border-blue-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              {bannerData.title || "Etkinlikleri Keşfet"}
            </h1>
            <p className="text-lg md:text-xl max-w-xl opacity-90 font-light">
              {bannerData.description || "Şehrindeki en popüler konser, tiyatro ve spor etkinliklerini kaçırma."}
            </p>
          </div>
          {bannerData.imageUrl && (
            <img
              src={bannerData.imageUrl}
              alt="Etkinlik"
              className="w-full md:w-80 rounded-3xl shadow-2xl border-4 border-blue-400/30 object-cover h-64"
            />
          )}
        </div>
      </div>

      {/*  Etkinlik Kartları */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-xl font-medium text-gray-500">Etkinlikler yükleniyor...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
             <p className="text-xl text-gray-500">Aradığın kriterlerde etkinlik bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const rawUrl = event.images?.find(img => img.ratio === "16_9")?.url || event.images?.[0]?.url;
              const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}`;

              return (
                <Link 
                  key={event.id} 
                  to={`/event/${event.id}`} 
                  className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full"
                >
                  <div className="relative overflow-hidden bg-gray-200">
                    <img
                      src={proxyUrl}
                      alt={event.name}
                      className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80"; 
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                      {event.dates?.start?.localDate}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="font-bold text-xl text-gray-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                      {event.name}
                    </h2>
                    <p className="text-gray-500 text-sm mb-4">
                      📍 {event._embedded?.venues?.[0]?.city?.name} - {event._embedded?.venues?.[0]?.name}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-blue-600 font-bold">
                      <span>Detayları Gör</span>
                      <span className="group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
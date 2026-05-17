import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CategoryPage = () => {
  const { categoryName } = useParams(); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryEvents = async () => {
      setLoading(true);
      const savedCity = localStorage.getItem('selectedCity');
      const apiCategoryName = 
        categoryName === 'music' ? 'music' : 
        categoryName === 'arts' ? 'arts' : 
        categoryName === 'sports' ? 'sports' : 
        categoryName === 'film' ? 'film' : '';

      try {
        let url = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=${apiCategoryName}&countryCode=TR&sort=relevance,desc&apikey=fbAxXXgAd8mDEingIoGHggKxmQ9GW45A`;

        if (savedCity && savedCity !== "Tumu") {
          url += `&city=${savedCity}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setEvents(data._embedded?.events || []);
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };

    window.scrollTo(0, 0);
    if (categoryName) {
      fetchCategoryEvents();
    }
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="relative bg-blue-900 mt-28 text-white py-12 px-6 md:px-20 shadow-lg border-b-4 border-blue-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 capitalize tracking-tight">
              {categoryName === 'music' ? '🎸 Konser Dünyası' : 
               categoryName === 'arts' ? '🎭 Sahne Sanatları' : 
               categoryName === 'sports' ? '⚽ Spor Heyecanı' : '🎬 Sinema Keyfi'}
            </h1>
            <p className="text-lg md:text-xl max-w-xl opacity-90 font-light">
              Şehrindeki ve Türkiye genelindeki en popüler {categoryName === 'music' ? 'müzik' : categoryName === 'arts' ? 'sanat' : categoryName === 'sports' ? 'spor' : 'sinema'} etkinliklerini keşfet.
            </p>
          </div>
          <div className="hidden md:block text-8xl opacity-10 select-none">
             {categoryName === 'music' ? '🎵' : categoryName === 'arts' ? '🖼️' : categoryName === 'sports' ? '🏆' : '🍿'}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-xl font-medium text-gray-500 animate-pulse">Etkinlikler aranıyor...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {events.map((event) => {
              // Görsel link
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
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm uppercase tracking-wider">
                      {event.dates?.start?.localDate}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-xl text-gray-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 flex items-center">
                      📍 {event._embedded?.venues?.[0]?.city?.name || 'Türkiye'} - {event._embedded?.venues?.[0]?.name || 'Etkinlik Alanı'}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-blue-600 font-bold">
                      <span>İncele</span>
                      <span className="group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {/* ⭐ DEĞİŞİM BİTTİ ⭐ */}

          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl shadow-inner border border-dashed border-gray-200">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Etkinlik Bulunamadı</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Seçtiğin şehirde şu an aktif {categoryName} etkinliği yok. Türkiye genelindeki etkinliklere bakmaya ne dersin?
            </p>
            <Link 
              to="/home" 
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Anasayfaya Dön
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
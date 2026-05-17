import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const CATEGORY_MAP = {
  Konser: "music",
  Spor: "sports",
  Tiyatro: "theatre",
  Komedi: "comedy",
  Aile: "family",
};

const API_KEY = 'fbAxXXgAd8mDEingIoGHggKxmQ9GW45A'; // Kendi API anahtarını buraya koy

const ForYouPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        let favs = [];
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          favs = userDoc.data()?.favorites || [];
        } catch (error) {
          if (error.code === 'permission-denied') {
            favs = JSON.parse(localStorage.getItem(`interestCategories_${user.uid}`)) || [];
            if (favs.length === 0) {
              setInfoMessage('Ilgi alanlari okunamadi. Lutfen profilini tekrar kaydet veya Firestore rules guncelle.');
            }
          } else {
            throw error;
          }
        }

        setFavorites(favs);

        const categories = favs.map(cat => CATEGORY_MAP[cat]).filter(Boolean);
        if (categories.length === 0) {
          setEvents([]);
          setLoading(false);
          return;
        }

        const allEventsArrays = await Promise.all(
          categories.map(async (category) => {
            const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?classificationName=${category}&countryCode=TR&apikey=${API_KEY}`);
            const data = await res.json();
            return data._embedded?.events || [];
          })
        );

        setEvents(allEventsArrays.flat());
      } catch (error) {
        console.error('Etkinlikler alınamadı:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Senin İçin Önerilen Etkinlikler</h1>

      {loading ? (
        <p className="text-center text-gray-600">Yükleniyor...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-red-600">{infoMessage || 'İlgi alanlarına uygun etkinlik bulunamadı.'}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src={event.images?.[0]?.url}
                alt={event.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{event.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {event.dates?.start?.localDate}
                </p>
                <p className="text-sm text-gray-500">
                  {event._embedded?.venues?.[0]?.name}
                </p>
                <Link
                 to={`/event/${event.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-blue-600 hover:underline"
                >
                  Detaylar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForYouPage;

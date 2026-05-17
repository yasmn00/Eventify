// src/pages/AdminPanel.jsx
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [banners, setBanners] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [newEvent, setNewEvent] = useState({ name: '', date: '', city: '' });
const [newBanner, setNewBanner] = useState({
  title: '',
  description: '',
  imageUrl: '',
});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const userSnap = await getDocs(collection(db, 'users'));
    setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const annSnap = await getDocs(collection(db, 'announcements'));
    setAnnouncements(annSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const evtSnap = await getDocs(collection(db, 'customEvents'));
    setEvents(evtSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const bannerSnap = await getDocs(collection(db, 'banners'));
    setBanners(bannerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const deleteUser = async (id) => {
    await deleteDoc(doc(db, 'users', id));
    fetchAll();
  };

  const updateUser = async (id, data) => {
    await updateDoc(doc(db, 'users', id), data);
    fetchAll();
  };

  const addAnnouncement = async () => {
    if (newAnnouncement.trim() !== '') {
      await addDoc(collection(db, 'announcements'), { text: newAnnouncement });
      setNewAnnouncement('');
      fetchAll();
    }
  };

  const deleteAnnouncement = async (id) => {
    await deleteDoc(doc(db, 'announcements', id));
    fetchAll();
  };

  const addEvent = async () => {
    if (newEvent.name && newEvent.date) {
      await addDoc(collection(db, 'customEvents'), newEvent);
      setNewEvent({ name: '', date: '', city: '' });
      fetchAll();
    }
  };

  const deleteEvent = async (id) => {
    await deleteDoc(doc(db, 'customEvents', id));
    fetchAll();
  };

const addBanner = async () => {
  const { title, description, imageUrl } = newBanner;
  if (title.trim() && description.trim() && imageUrl.trim()) {
    await addDoc(collection(db, 'banners'), {
      title,
      description,
      imageUrl,
    });
    setNewBanner({ title: '', description: '', imageUrl: '' });
    fetchAll();
  }
};


  const deleteBanner = async (id) => {
    await deleteDoc(doc(db, 'banners', id));
    fetchAll();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {/* Kullanıcı Yönetimi */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Kullanıcılar</h2>
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-gray-100 p-3 rounded mb-2 flex justify-between items-center"
          >
            <div>
              <p><strong>{user.email}</strong></p>
              <p>Onaylı: {user.isApproved ? 'Evet' : 'Hayır'}</p>
              <p>Admin: {user.isAdmin ? 'Evet' : 'Hayır'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateUser(user.id, { isApproved: !user.isApproved })}
                className="bg-blue-500 px-3 py-1 text-white rounded"
              >
                {user.isApproved ? 'Onayı Kaldır' : 'Onayla'}
              </button>
              <button
                onClick={() => updateUser(user.id, { isAdmin: !user.isAdmin })}
                className="bg-yellow-500 px-3 py-1 text-white rounded"
              >
                {user.isAdmin ? 'Adminlik Kaldır' : 'Admin Yap'}
              </button>
              <button
                onClick={() => deleteUser(user.id)}
                className="bg-red-500 px-3 py-1 text-white rounded"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Duyurular */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Duyurular</h2>
        <div className="flex gap-2 mb-4">
          <input
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            className="border p-2 flex-1"
            placeholder="Yeni duyuru"
          />
          <button onClick={addAnnouncement} className="bg-green-600 px-4 py-2 text-white rounded">
            Ekle
          </button>
        </div>
        {announcements.map((a) => (
          <div key={a.id} className="bg-gray-100 p-3 rounded mb-2 flex justify-between">
            <p>{a.text}</p>
            <button
              onClick={() => deleteAnnouncement(a.id)}
              className="bg-red-500 px-3 py-1 text-white rounded"
            >
              Sil
            </button>
          </div>
        ))}
      </section>

      {/* Etkinlikler */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Etkinlikler</h2>
        <div className="flex gap-2 mb-4">
          <input
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            className="border p-2"
            placeholder="Etkinlik adı"
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            className="border p-2"
          />
          <input
            value={newEvent.city}
            onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
            className="border p-2"
            placeholder="Şehir"
          />
          <button onClick={addEvent} className="bg-green-600 px-4 py-2 text-white rounded">
            Ekle
          </button>
        </div>
        {events.map((e) => (
          <div key={e.id} className="bg-gray-100 p-3 rounded mb-2 flex justify-between">
            <div>
              <p><strong>{e.name}</strong></p>
              <p>{e.date} - {e.city}</p>
            </div>
            <button
              onClick={() => deleteEvent(e.id)}
              className="bg-red-500 px-3 py-1 text-white rounded"
            >
              Sil
            </button>
          </div>
        ))}
      </section>

      {/* Banner Yönetimi */}
 {/* Banner Yönetimi */}
<section>
  <h2 className="text-xl font-semibold mb-2">Bannerlar</h2>
  <div className="flex flex-col gap-2 mb-4">
    <input
      value={newBanner.title}
      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
      className="border p-2"
      placeholder="Banner başlığı"
    />
    <input
      value={newBanner.description}
      onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
      className="border p-2"
      placeholder="Banner açıklaması"
    />
    <input
      value={newBanner.imageUrl}
      onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
      className="border p-2"
      placeholder="Banner görsel URL'si"
    />
    <button
      onClick={addBanner}
      className="bg-green-600 px-4 py-2 text-white rounded"
    >
      Ekle
    </button>
  </div>

  {banners.map((banner) => (
    <div
      key={banner.id}
      className="bg-gray-100 p-3 rounded mb-2 flex justify-between items-center"
    >
      <div className="flex items-center gap-4">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-32 h-auto rounded shadow"
        />
        <div>
          <h3 className="text-lg font-bold">{banner.title}</h3>
          <p className="text-sm text-gray-700">{banner.description}</p>
        </div>
      </div>
      <button
        onClick={() => deleteBanner(banner.id)}
        className="bg-red-500 px-3 py-1 text-white rounded"
      >
        Sil
      </button>
    </div>
  ))}
</section>

    </div>
  );
};

export default AdminPanel;

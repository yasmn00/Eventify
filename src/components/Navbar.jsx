import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const TR_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort();

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [city, setCity] = useState(localStorage.getItem('selectedCity') === "Tumu" ? "Türkiye Geneli" : (localStorage.getItem('selectedCity') || 'Türkiye Geneli'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  const handleCityChange = (e) => {
    const rawCity = e.target.value;

    if (rawCity === "Türkiye Geneli") {
      localStorage.setItem('selectedCity', "Tumu");
      setCity("Türkiye Geneli");
    } else {
      const englishCity = rawCity
        .replace(/İ/g, "I").replace(/ı/g, "i")
        .replace(/Ğ/g, "G").replace(/ğ/g, "g")
        .replace(/Ü/g, "U").replace(/ü/g, "u")
        .replace(/Ş/g, "S").replace(/ş/g, "s")
        .replace(/Ö/g, "O").replace(/ö/g, "o")
        .replace(/Ç/g, "C").replace(/ç/g, "c");

      setCity(rawCity);
      localStorage.setItem('selectedCity', englishCity);
    }
    window.location.reload(); 
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Çıkış yapılamadı:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-50 rounded-b-xl border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        
        {/* SOL: LOGO VE MASAÜSTÜ SEÇİCİ */}
        <div className="flex items-center space-x-4">
          <Link to="/home" className="text-3xl font-bold text-blue-600 tracking-tight">
            🎟️ Eventify
          </Link>
          
          <select 
            value={city} 
            onChange={handleCityChange}
            className="hidden sm:block p-1 border border-blue-100 rounded-lg text-sm bg-blue-50 text-blue-700 outline-none focus:ring-2 focus:ring-blue-400 font-medium cursor-pointer shadow-sm"
          >
            <option value="Türkiye Geneli">Şehir</option> 
            {TR_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* SAĞ: MASAÜSTÜ LİNKLER */}
        <div className="hidden md:flex items-center space-x-6 text-lg">
          <Link to="/home" className="text-gray-700 hover:text-blue-600 transition font-medium">Anasayfa</Link>
          <Link to="/category/arts" className="text-gray-700 hover:text-blue-600 transition">Sahne</Link>
          <Link to="/category/music" className="text-gray-700 hover:text-blue-600 transition">Konser</Link>
          <Link to="/category/sports" className="text-gray-700 hover:text-blue-600 transition">Spor</Link>
          <Link to="/category/film" className="text-gray-700 hover:text-blue-600 transition">Sinema</Link>
          {user && <Link to="/private" className="text-blue-600 font-semibold hover:text-blue-700 transition">👤 Hesabım</Link>}          
          {!user && <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Giriş</Link>}


          {user && (
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-bold"
            >
              Çıkış
            </button>
          )}
        </div>

        {/* Hamburger Menü Butonu */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl text-gray-700">☰</button>
      </div>

      {/* MOBİL MENÜ İÇERİĞİ */}
      {menuOpen && (
        <div className="md:hidden bg-white px-4 pb-6 space-y-4 border-t animate-fade-in-down">
          <div className="pt-4 border-b pb-4">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">📍 Konum Seçin</p>
            <select 
              value={city} 
              onChange={handleCityChange}
              className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-blue-700 font-bold outline-none"
            >
              <option value="Türkiye Geneli">🌍 Türkiye Geneli</option> 
              {TR_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <Link to="/home" className="block text-gray-700 font-bold text-lg">Anasayfa</Link>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/category/arts" className="bg-gray-50 p-3 rounded-xl text-center text-sm font-medium border border-gray-100">Sahne</Link>
            <Link to="/category/music" className="bg-gray-50 p-3 rounded-xl text-center text-sm font-medium border border-gray-100">Konser</Link>
            <Link to="/category/sports" className="bg-gray-50 p-3 rounded-xl text-center text-sm font-medium border border-gray-100">Spor</Link>
            <Link to="/category/film" className="bg-gray-50 p-3 rounded-xl text-center text-sm font-medium border border-gray-100">Sinema</Link>
          </div>
          
          <Link to="/private" className="block text-blue-600 font-bold text-lg pt-2 border-t">👤 Hesabım / Siparişlerim</Link>
          
          {user && (
            <button onClick={handleLogout} className="w-full text-left text-red-600 font-bold pt-2">Çıkış Yap</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
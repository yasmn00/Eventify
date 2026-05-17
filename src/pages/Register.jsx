import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // firebase config dosyanın yolu
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signOut, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

const handleRegister = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;
  setError('');

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedFirstName = firstName.trim();
  const normalizedLastName = lastName.trim();

  if (password !== confirmPassword) {
    setError('Şifreler uyuşmuyor.');
    return;
  }

  if (!normalizedFirstName || !normalizedLastName) {
    setError('Ad ve soyad zorunludur.');
    return;
  }

  if (password.length < 6) {
    setError('Şifre en az 6 karakter olmalıdır.');
    return;
  }

  try {
    setIsSubmitting(true);
    const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
    if (signInMethods.length > 0) {
      setError('Bu e-posta ile zaten bir hesap var.');
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

    await updateProfile(userCredential.user, {
      displayName: `${normalizedFirstName} ${normalizedLastName}`,
    });

    try {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email: normalizedEmail,
        favorites,
        isVerificated: false,
        isAdmin: false,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (firestoreError) {
      // Auth kaydı başarılı olsa bile profil dokümanı yazımı kural/izin nedeniyle başarısız olabilir.
      console.error('Firestore kullanıcı profili yazılamadı:', firestoreError);
    }

    localStorage.setItem(
      `interestCategories_${userCredential.user.uid}`,
      JSON.stringify(favorites)
    );

    setError('');
    await signOut(auth);
    navigate('/login');
  } catch (err) {
    console.log('Kayıt hatası:', err);
    if (err.code === 'auth/email-already-in-use') {
      setError('Bu e-posta ile zaten bir hesap var.');
    } else if (err.code === 'auth/invalid-email') {
      setError('Geçerli bir e-posta adresi girin.');
    } else if (err.code === 'auth/weak-password') {
      setError('Şifre en az 6 karakter olmalıdır.');
    } else if (err.code === 'auth/operation-not-allowed') {
      setError('Firebase üzerinde Email/Password giriş yöntemi aktif değil.');
    } else {
      setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  } finally {
    setIsSubmitting(false);
  }
};


  const handleLogin = () => {
    navigate("/login"); // giriş sayfası yolunu doğru ayarla
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-20 bg-gray-700">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">İsim</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adınız"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Soyisim</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Soyadınız"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ornek@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre Tekrar</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">İlgi Alanları (Etkinlik Türleri)</label>
  <div className="flex flex-wrap gap-2">
    {["Konser", "Tiyatro", "Spor", "Festival", "Atölye"].map((category) => (
      <label key={category} className="flex items-center space-x-2">
        <input
          type="checkbox"
          value={category}
          checked={favorites.includes(category)}
          onChange={(e) => {
            if (e.target.checked) {
              setFavorites([...favorites, category]);
            } else {
              setFavorites(favorites.filter((fav) => fav !== category));
            }
          }}
        />
        <span>{category}</span>
      </label>
    ))}
  </div>
</div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition duration-300"
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>

          <button
            onClick={handleLogin}
            type="button"  // type submit olmasın, yanlışlık olmasın diye
            className="w-full bg-blue-400 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-300"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

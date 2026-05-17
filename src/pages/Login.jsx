import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';  // Firebase konfigürasyonun yolu
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      // Kullanıcı bilgilerini localStorage'a kaydet
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        creationTime: user.metadata?.creationTime,
        lastSignInTime: user.metadata?.lastSignInTime
      };
      localStorage.setItem('user', JSON.stringify(userData));

      setError('');
      navigate('/home');
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('E-posta veya şifre hatalı.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Şifre hatalı.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Geçerli bir e-posta adresi girin.');
      } else {
        setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-700">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h2>
        <form onSubmit={handleLogin} className="space-y-4">
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

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-300"
          >
            Giriş Yap
          </button>

          <button
            onClick={handleRegister}
            type="button"
            className="w-full bg-green-400 text-white py-2 rounded-xl hover:bg-green-700 transition duration-300"
          >
            Kayıt Ol
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { updatePassword } from 'firebase/auth';

const PasswordReset = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      await updatePassword(user, newPassword);
      setError('');
      setSuccess('Şifreniz başarıyla güncellendi!');
      
      // İstersen buraya logout ve login sayfasına yönlendirme koyabilirsin:
      // auth.signOut();
      // navigate('/login');

      // Ya da direkt anasayfaya yönlendir
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-700">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Şifre Yenile</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Yeni şifrenizi girin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tekrar yeni şifrenizi girin"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-300"
          >
            Şifreyi Güncelle
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;

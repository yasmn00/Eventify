import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/Home';
import Navbar from './components/Navbar';
import EventDetails from './pages/EventDetails';
import Cart from './pages/Cart';
import PasswordReset from './pages/PasswordReset';
import ForYou from './pages/ForYou';
import AdminPanel from './pages/AdminPanel';
import AdminRoute from './route/AdminRoute';
import Private from './pages/Private';
import CategoryPage from './pages/CategoryPage';
import SeatSelection from './components/SeatSelection'; // Koltuk seçim bileşenini ekledik

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          {/* Ana Sayfalar */}
          <Route exact path='/' element={<Login />} />
          <Route exact path='/register' element={<Register />} />
          <Route exact path='/home' element={<HomePage />} />
          <Route exact path='/category/:categoryName' element={<CategoryPage />} />
          
          {/* Etkinlik Detay ve Koltuk Seçimi */}
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/seats" element={<SeatSelection />} /> {/* Koltuk seçim yolu */}

          {/* Kullanıcı İşlemleri */}
          <Route exact path='/cart' element={<Cart />} />
          <Route exact path='/password-reset' element={<PasswordReset />} />
          <Route exact path='/private' element={<Private />} />
          <Route exact path='/for-you' element={<ForYou />} />
          
          {/* Yönetim Paneli */}
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
// src/components/AdminRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const docSnap = await getDoc(ref);
        if (docSnap.exists() && docSnap.data().isAdmin) {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  if (loading) return <p>Yükleniyor...</p>;
  if (!isAdmin) return <Navigate to="/home" replace />;

  return children;
};

export default AdminRoute;

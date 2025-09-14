import { RouterProvider } from "react-router-dom";
import router from './routes';
import { useState, useEffect } from "react";
import { AuthContext } from '@/contexts/authContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check for saved authentication state on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setIsAuthenticated(true);
    }
  }, []);
  
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };
  
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}

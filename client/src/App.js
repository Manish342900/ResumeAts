import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import AnalysisResults from './components/AnalysisResults';
import Login from './pages/Login';
import Register from './pages/Register';
import ResumeHistory from './components/ResumeHistory';
import Dashboard from './pages/Dashboard';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import axiosInstance from './axiosInstance';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      const cachedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        return;
      }

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/verify-auth');
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/register') {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate]);


  const handleAuthSuccess = async (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ThemeProvider>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route
            path='/home'
            element={<Home/>}/>
            <Route
              path="/"
              element={<Navigate to={user ? '/dashboard' : '/home'} replace />}
            />
            <Route
              path="/analyze"
              element={
                <ProtectedRoute user={user}>
                  <ResumeAnalyzer user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute user={user}>
                  <ResumeHistory user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <Login onAuthSuccess={handleAuthSuccess} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" replace /> : <Register onAuthSuccess={handleAuthSuccess} />}
            />
            <Route
              path="/analysis-results"
              element={
                <ProtectedRoute user={user}>
                  <AnalysisResults user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis/:id"
              element={
                <ProtectedRoute user={user}>
                  <AnalysisResults user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <Dashboard user={user} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

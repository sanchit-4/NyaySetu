
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { PATHS } from './constants';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import { LanguageProvider } from './context/LanguageContext'; // Import LanguageProvider
import Flashcards from './components/Flashcards';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false); 
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleAuthSuccess = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-lightbg">
        <div className="text-xl text-primary">Loading Nyay Sahayak...</div>
      </div>
    );
  }

  return (
    <LanguageProvider> {/* Wrap with LanguageProvider */}
      <HashRouter>
        <AppRoutes currentUser={currentUser} onAuthSuccess={handleAuthSuccess} onLogout={handleLogout} />
      </HashRouter>
    </LanguageProvider>
  );
};

interface AppRoutesProps {
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
  onLogout: () => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ currentUser, onAuthSuccess, onLogout }) => {
  return (
    <Routes>
      <Route 
        path={PATHS.LANDING} 
        element={currentUser ? <Navigate to={PATHS.DASHBOARD_ROOT} replace /> : <LandingPage />} 
      />
      <Route 
        path={PATHS.AUTH_ROUTE_PATTERN} 
        element={currentUser ? <Navigate to={PATHS.DASHBOARD_ROOT} replace /> : <AuthPage onAuthSuccess={onAuthSuccess} />} 
      />
      <Route 
        path={`${PATHS.DASHBOARD_ROOT}/*`} 
        element={currentUser ? <DashboardPage user={currentUser} onLogout={onLogout} /> : <Navigate to={PATHS.LOGIN} replace />} 
      />
     <Route path="/flashcards" element={<Flashcards />} />
       <Route path="*" element={<Navigate to={currentUser ? PATHS.DASHBOARD_ROOT : PATHS.LANDING} replace />} />
    </Routes>
  );
};

export default App;

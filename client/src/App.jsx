import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MemeFeedPage from './pages/MemeFeedPage';
import UploadMemePage from './pages/UploadMemePage';
import MemeDetailPage from './pages/MemeDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import StatsPage from './pages/StatsPage';

/**
 * PROTECTED ROUTE WRAPPER
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * PUBLIC ROUTE WRAPPER
 * Redirects authenticated users away from login/signup pages
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <Navigate to="/memes" /> : children;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Auth Routes - redirect if already logged in */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />
          
          {/* Public */}
          <Route path="/memes" element={<MemeFeedPage />} />
          <Route path="/memes/:id" element={<MemeDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/stats" element={<StatsPage />} />
          
          {/* Protected Routes - require authentication */}
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadMemePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
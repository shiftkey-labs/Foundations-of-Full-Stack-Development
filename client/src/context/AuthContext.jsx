import { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext();

/**
 * CUSTOM HOOK
 * Use this in any component to access auth state
 * Example: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const normalizeUser = (user) => {
    if (!user) return null;
    return {
      ...user,
      id: user.id || user._id
    };
  };

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load user');
      }
      
      const data = await response.json();
      setUser(normalizeUser(data.user));
    } catch (error) {
      console.error('Load user error:', error);
      // If token is invalid, remove it
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  
  // LOGIN function
  // Called after successful login/signup
   
  const login = (token, userData) => {
    // Save token to localStorage
    localStorage.setItem('token', token);
    setToken(token);
    setUser(normalizeUser(userData));
  };

  // LOGOUT function
  // Clears all authentication data
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => {
      if (!prev) return prev;
      return normalizeUser({ ...prev, ...updates });
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    refreshUser: loadUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
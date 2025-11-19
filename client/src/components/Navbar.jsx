import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            🎭 Battle of Memes
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/memes" 
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Memes
            </Link>
            
            <Link 
              to="/leaderboard" 
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Leaderboard
            </Link>

            <Link 
              to="/stats" 
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Stats
            </Link>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/upload" 
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Upload
                </Link>
                
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Profile
                </Link>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Hi, {user?.username}!
                  </span>
                  
                  <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Login
                </Link>
                
                <Link 
                  to="/signup" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
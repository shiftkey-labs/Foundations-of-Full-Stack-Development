import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          🎭 Battle of the Memes
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload your funniest memes, vote on others, and climb the leaderboard!
        </p>
        
        {isAuthenticated ? (
          <div className="flex gap-4 justify-center">
            <Link
              to="/upload"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Upload Meme
            </Link>
            <Link
              to="/memes"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition"
            >
              Browse Memes
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/memes"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition"
            >
              Browse Memes
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">📸</div>
          <h3 className="text-xl font-bold mb-2">Upload Memes</h3>
          <p className="text-gray-600">
            Share your hilarious memes with the community
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">👍</div>
          <h3 className="text-xl font-bold mb-2">Vote & Comment</h3>
          <p className="text-gray-600">
            Upvote the best, downvote the rest, and join the discussion
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">Compete</h3>
          <p className="text-gray-600">
            Climb the leaderboard and become a meme legend
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-16 bg-indigo-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-6">Join the Battle!</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold">1000+</div>
            <div className="text-indigo-200">Memes Uploaded</div>
          </div>
          <div>
            <div className="text-4xl font-bold">500+</div>
            <div className="text-indigo-200">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold">10K+</div>
            <div className="text-indigo-200">Votes Cast</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
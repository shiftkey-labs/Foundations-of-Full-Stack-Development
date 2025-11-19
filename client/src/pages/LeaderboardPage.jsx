import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

function LeaderboardPage() {
  const [topMemes, setTopMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(
        `http://localhost:8000/api/leaderboard?limit=20`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load leaderboard');
      }
      
      const data = await response.json();
      setTopMemes(data);
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded inline-block">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        🏆 Leaderboard
      </h1>

      {topMemes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl text-gray-600">No memes yet!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topMemes.map((meme, index) => (
            <div
              key={meme._id}
              className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition ${
                index < 3 ? 'border-2' : ''
              } ${
                index === 0 ? 'border-yellow-400' :
                index === 1 ? 'border-gray-400' :
                index === 2 ? 'border-orange-400' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {index === 0 && <span className="text-4xl">🥇</span>}
                  {index === 1 && <span className="text-4xl">🥈</span>}
                  {index === 2 && <span className="text-4xl">🥉</span>}
                  {index > 2 && (
                    <span className="text-2xl font-bold text-gray-600">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Meme Image */}
                <Link to={`/memes/${meme._id}`} className="flex-shrink-0">
                  <img
                    src={meme.imageUrl}
                    alt={meme.title}
                    className="w-24 h-24 object-cover rounded-lg hover:opacity-80 transition"
                    onError={(e) => {
                      e.target.src = 'https://i.imgur.com/SjAWzfs.jpeg';
                    }}
                  />
                </Link>

                {/* Meme Info */}
                <div className="flex-grow">
                  <Link to={`/memes/${meme._id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition">
                      {meme.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500">
                    by {meme.uploadedBy.username}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(meme.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Vote Count */}
                <div className="flex-shrink-0 text-center">
                  <div className={`text-3xl font-bold ${
                    meme.voteCount > 0 ? 'text-green-600' :
                    meme.voteCount < 0 ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {meme.voteCount > 0 ? '+' : ''}{meme.voteCount}
                  </div>
                  <div className="text-sm text-gray-500">votes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeaderboardPage;
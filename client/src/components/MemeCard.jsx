import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MemeCard({ meme, onVoteUpdate }) {
  const { isAuthenticated } = useAuth();
  const [userVote, setUserVote] = useState(meme.userVote);
  const [voteCount, setVoteCount] = useState(meme.voteCount);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    if (isVoting) return; // Prevent multiple clicks

    setIsVoting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/memes/${meme._id}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ voteType })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to record vote');
      }
      
      const data = await response.json();
      setUserVote(data.userVote);
      setVoteCount(data.voteCount);
      
      // Call parent component callback if provided
      if (onVoteUpdate) {
        onVoteUpdate(meme._id, data.voteCount);
      }
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to record vote');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <Link to={`/memes/${meme._id}`}>
        <img
          src={meme.imageUrl}
          alt={meme.title}
          className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition"
          onError={(e) => {
            e.target.src = 'https://i.imgur.com/SjAWzfs.jpeg';
          }}
        />
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/memes/${meme._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition">
            {meme.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-500 mt-1">
          by {meme.uploadedBy?.username || 'Unknown'} •{' '}
          {new Date(meme.createdAt).toLocaleDateString()}
        </p>

        {/* Voting Section */}
        <div className="flex items-center gap-4 mt-4">
          {/* Upvote Button */}
          <button
            onClick={() => handleVote('up')}
            disabled={isVoting}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
              userVote === 'up'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-xl">👍</span>
            <span className="font-medium">
              {userVote === 'up' ? 'Upvoted' : 'Upvote'}
            </span>
          </button>

          {/* Vote Count */}
          <span className={`text-xl font-bold ${
            voteCount > 0 ? 'text-green-600' : 
            voteCount < 0 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {voteCount}
          </span>

          {/* Downvote Button */}
          <button
            onClick={() => handleVote('down')}
            disabled={isVoting}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
              userVote === 'down'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-red-100'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-xl">👎</span>
            <span className="font-medium">
              {userVote === 'down' ? 'Downvoted' : 'Downvote'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemeCard;
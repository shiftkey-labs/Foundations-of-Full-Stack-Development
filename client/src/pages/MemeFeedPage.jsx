import { useState, useEffect } from 'react';
import MemeCard from '../components/MemeCard';
import LoadingSpinner from '../components/LoadingSpinner';

function MemeFeedPage() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(
        `http://localhost:8000/api/memes`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load memes');
      }
      
      const data = await response.json();
      setMemes(data);
    } catch (error) {
      console.error('Fetch memes error:', error);
      setError('Failed to load memes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (memeId, newVoteCount) => {
    setMemes(prevMemes =>
      prevMemes.map(meme =>
        meme._id === memeId
          ? { ...meme, voteCount: newVoteCount }
          : meme
      )
    );
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Meme Feed
        </h1>
        <p className="text-gray-600">
          {memes.length} {memes.length === 1 ? 'meme' : 'memes'}
        </p>
      </div>

      {memes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl text-gray-600 mb-4">No memes yet!</p>
          <p className="text-gray-500">Be the first to upload a meme.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memes.map(meme => (
            <MemeCard
              key={meme._id}
              meme={meme}
              onVoteUpdate={handleVoteUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MemeFeedPage;
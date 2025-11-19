import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MemeCard from '../components/MemeCard.jsx';

function EditableMemeCard({ meme, onVoteUpdate, onSaveTitle, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(meme.title);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setTitleInput(meme.title);
  }, [meme.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      setStatus({ type: 'error', message: 'Title cannot be empty' });
      return;
    }

    if (titleInput.trim() === meme.title) {
      setStatus({ type: 'info', message: 'Title unchanged' });
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await onSaveTitle(meme._id, titleInput.trim());
      setStatus({ type: 'success', message: 'Title updated!' });
      setIsEditing(false);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <MemeCard meme={meme} onVoteUpdate={onVoteUpdate} />
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Manage Meme</h3>
          <button
            onClick={() => setIsEditing(prev => !prev)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {isEditing ? 'Cancel' : 'Edit Title'}
          </button>
        </div>

        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={120}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Title'}
              </button>
              <button
                type="button"
                onClick={() => setTitleInput(meme.title)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        )}

        {status && (
          <p
            className={`text-sm mt-3 ${
              status.type === 'success'
                ? 'text-green-600'
                : status.type === 'error'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {status.message}
          </p>
        )}

        <button
          type="button"
          onClick={async () => {
            if (deleting) return;
            const confirmed = window.confirm('Delete this meme? This cannot be undone.');
            if (!confirmed) return;

            setDeleting(true);
            setStatus(null);

            try {
              await onDelete(meme._id);
              setStatus({ type: 'success', message: 'Meme deleted' });
            } catch (error) {
              setStatus({ type: 'error', message: error.message });
            } finally {
              setDeleting(false);
            }
          }}
          className="mt-4 w-full border border-red-200 text-red-600 rounded-lg py-2 hover:bg-red-50 transition disabled:opacity-60"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Meme'}
        </button>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [userMemes, setUserMemes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState(user?.username || '');
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameSaving, setUsernameSaving] = useState(false);

  const userId = user?.id || user?._id;

  const fetchUserData = useCallback(async () => {
    if (!userId || !token) return;

    try {
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Fetch all memes
      const memesResponse = await fetch(
        `http://localhost:8000/api/memes`,
        { headers }
      );
      
      if (!memesResponse.ok) {
        throw new Error('Failed to fetch memes');
      }
      
      const memesData = await memesResponse.json();
      const myMemes = memesData.filter(
        meme => meme.uploadedBy._id === userId
      );
      setUserMemes(myMemes);

      const statsResponse = await fetch(
        `http://localhost:8000/api/leaderboard/user/${userId}`,
        { headers }
      );
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Fetch user data error:', error);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    setUsernameInput(user?.username || '');
  }, [user?.username]);

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();

    if (!usernameInput.trim()) {
      setUsernameStatus({ type: 'error', message: 'Username cannot be empty' });
      return;
    }

    if (usernameInput.trim() === user?.username) {
      setUsernameStatus({ type: 'info', message: 'Username is unchanged' });
      return;
    }

    setUsernameSaving(true);
    setUsernameStatus(null);

    try {
      const response = await fetch('http://localhost:8000/api/auth/me/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: usernameInput.trim() })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update username');
      }

      updateUser({ username: data.user.username });
      setUsernameStatus({ type: 'success', message: 'Username updated!' });
    } catch (error) {
      setUsernameStatus({ type: 'error', message: error.message });
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleMemeTitleUpdate = async (memeId, newTitle) => {
    const response = await fetch(`http://localhost:8000/api/memes/${memeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update meme title');
    }

    setUserMemes(prev =>
      prev.map(meme =>
        meme._id === memeId ? { ...meme, title: data.meme.title } : meme
      )
    );
  };

  const handleDeleteMeme = async (memeId) => {
    const response = await fetch(`http://localhost:8000/api/memes/${memeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete meme');
    }

    setUserMemes(prev => prev.filter(meme => meme._id !== memeId));
    await fetchUserData();
  };

  const handleVoteUpdate = (memeId, newVoteCount) => {
    setUserMemes(prevMemes =>
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

  if (!userId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {user.username}
            </h1>
            <p className="text-gray-600">{user.email}</p>

            <form onSubmit={handleUsernameUpdate} className="mt-6 space-y-3 max-w-lg">
              <label className="block text-sm font-medium text-gray-700">
                Update your username
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={30}
                />
                <button
                  type="submit"
                  disabled={usernameSaving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  {usernameSaving ? 'Saving...' : 'Save Username'}
                </button>
              </div>
              {usernameStatus && (
                <p
                  className={`text-sm ${
                    usernameStatus.type === 'success'
                      ? 'text-green-600'
                      : usernameStatus.type === 'error'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {usernameStatus.message}
                </p>
              )}
            </form>
          </div>
          
          <Link
            to="/upload"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Upload New Meme
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {stats.totalMemes}
              </div>
              <div className="text-gray-600">Memes Uploaded</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.totalVotes}
              </div>
              <div className="text-gray-600">Total Votes</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.averageVotes}
              </div>
              <div className="text-gray-600">Average Votes</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.topMeme ? stats.topMeme.voteCount : 0}
              </div>
              <div className="text-gray-600">Top Meme Votes</div>
            </div>
          </div>
        )}
      </div>

      {/* User's Top Meme */}
      {stats?.topMeme && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🏆 Your Top Meme
          </h2>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-1 rounded-lg">
            <div className="bg-white p-4 rounded-lg">
              <Link to={`/memes/${stats.topMeme._id}`} className="flex items-center gap-4">
                <img
                  src={stats.topMeme.imageUrl}
                  alt={stats.topMeme.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition">
                    {stats.topMeme.title}
                  </h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {stats.topMeme.voteCount} votes
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* User's Memes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your Memes ({userMemes.length})
        </h2>

        {userMemes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-xl text-gray-600 mb-4">
              You haven't uploaded any memes yet
            </p>
            <Link
              to="/upload"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Upload Your First Meme
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userMemes.map(meme => (
              <EditableMemeCard
                key={meme._id}
                meme={meme}
                onVoteUpdate={handleVoteUpdate}
                onSaveTitle={handleMemeTitleUpdate}
                onDelete={handleDeleteMeme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
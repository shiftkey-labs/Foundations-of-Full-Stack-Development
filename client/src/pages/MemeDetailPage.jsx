import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function MemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [meme, setMeme] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const [userVote, setUserVote] = useState(null);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    fetchMeme();
  }, [id]);

  const fetchMeme = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(
        `http://localhost:8000/api/memes/${id}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch meme');
      }
      
      const data = await response.json();
      setMeme(data);
      setComments(data.comments || []);
      setUserVote(data.userVote);
      setVoteCount(data.voteCount);
    } catch (error) {
      console.error('Fetch meme error:', error);
      setError('Meme not found');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/memes/${id}/vote`,
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
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to record vote');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }

    setIsSubmittingComment(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/memes/${id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text: newComment })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Comment error:', error);
      alert('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteMeme = async () => {
    if (!window.confirm('Are you sure you want to delete this meme?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/memes/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete meme');
      }
      
      navigate('/memes');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete meme');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/memes/${id}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Delete comment error:', error);
      alert('Failed to delete comment');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !meme) {
    return (
      <div className="text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded inline-block">
          {error || 'Meme not found'}
        </div>
        <div className="mt-4">
          <Link to="/memes" className="text-indigo-600 hover:underline">
            ← Back to Memes
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && meme.uploadedBy._id === user.id;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/memes" className="text-indigo-600 hover:underline mb-4 inline-block">
        ← Back to Memes
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Meme Image */}
        <img
          src={meme.imageUrl}
          alt={meme.title}
          className="w-full max-h-[600px] object-contain bg-gray-100"
          onError={(e) => { // this runs if the image fails to load (invalid URL)
            console.error('Image not found, using fallback');
            e.target.src = 'https://i.imgur.com/SjAWzfs.jpeg';
          }}
        />

        {/* Meme Info */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {meme.title}
              </h1>
              <p className="text-gray-600">
                by <span className="font-semibold">{meme.uploadedBy.username}</span> •{' '}
                {new Date(meme.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Edit/Delete buttons for owner */}
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteMeme}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Voting */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => handleVote('up')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                userVote === 'up'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 hover:bg-green-100'
              }`}
            >
              <span className="text-2xl">👍</span>
              <span>Upvote</span>
            </button>

            <span className={`text-2xl font-bold ${
              voteCount > 0 ? 'text-green-600' : 
              voteCount < 0 ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {voteCount}
            </span>

            <button
              onClick={() => handleVote('down')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                userVote === 'down'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 hover:bg-red-100'
              }`}
            >
              <span className="text-2xl">👎</span>
              <span>Downvote</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <p className="text-gray-600 mb-6">
                <Link to="/login" className="text-indigo-600 hover:underline">
                  Login
                </Link>{' '}
                to comment
              </p>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500">No comments yet. Be the first!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-800">
                          {comment.userId.username}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {user && comment.userId._id === user.id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemeDetailPage;
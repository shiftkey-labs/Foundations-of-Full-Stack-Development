import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

function StatsCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
      <p className="text-sm text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-4xl font-bold mt-2 ${accent}`}>{value.toLocaleString()}</p>
    </div>
  );
}

function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/stats');
        if (!response.ok) {
          throw new Error('Failed to load stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError('Unable to load stats right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Community Stats</h1>
        <p className="text-gray-600">
          Real-time snapshot of how the Battle of Memes community is doing.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatsCard label="Total Memes Posted" value={stats.totalMemes} accent="text-indigo-600" />
        <StatsCard label="Total Votes Cast" value={stats.totalVotes} accent="text-green-600" />
      </div>

      <div className="mt-10 bg-white rounded-xl border border-dashed border-indigo-200 p-6 text-center">
        <p className="text-lg text-gray-700">
          Keep the numbers climbing! Upload new memes or support your favorites with an upvote.
        </p>
      </div>
    </div>
  );
}

export default StatsPage;


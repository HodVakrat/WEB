import { useState, useEffect } from 'react';
import { getResults } from '../services/ResultService';

export default function HistoryPage({ profileId, profileName, onNavigate }) {
    const [filterSubject, setFilterSubject] = useState('all');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!profileId) {
            setLoading(false);
            setError('No profile selected.');
            return;
        }
        setLoading(true);
        setError('');
        getResults(profileId)
            .then((data) => setResults(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [profileId]);

    const subjects = ['all', ...new Set(results.map(r => r.subject))];

    const filteredResults = filterSubject === 'all'
        ? results
        : results.filter(r => r.subject === filterSubject);

    const getScorePercentage = (score, total) => total > 0 ? Math.round((score / total) * 100) : 0;

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-500 dark:text-green-400';
        if (percentage >= 60) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-red-500 dark:text-red-400';
    };

    const getBarColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-bounce">📚</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Loading history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => onNavigate && onNavigate('parent')}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5"
                >
                    ← Back to Profiles
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profileName ? `${profileName}'s History` : 'Quiz History'} 📚
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 mb-6 text-center">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {results.length === 0 && !error ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No quizzes yet</p>
                    <p className="text-gray-400 dark:text-gray-500">Complete some quizzes to see history here!</p>
                </div>
            ) : (
                <>
                    {/* Filter Buttons */}
                    {subjects.length > 2 && (
                        <div className="mb-6">
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 font-semibold">FILTER BY SUBJECT</p>
                            <div className="flex flex-wrap gap-2">
                                {subjects.map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => setFilterSubject(subject)}
                                        className={`px-4 py-2 rounded-lg transition-all font-semibold capitalize text-sm ${
                                            filterSubject === subject
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500'
                                        }`}
                                    >
                                        {subject === 'all' ? 'All' : capitalize(subject)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* History List */}
                    <div className="space-y-3">
                        {filteredResults.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No history found for this subject</p>
                            </div>
                        ) : (
                            filteredResults.map(item => {
                                const percentage = getScorePercentage(item.score, item.total);
                                return (
                                    <div
                                        key={item._id}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                            <div className="md:col-span-2">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{capitalize(item.subject)}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {capitalize(item.level)} &middot; {formatDate(item.date)} at {formatTime(item.date)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SCORE</p>
                                                <p className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                                                    {item.score}/{item.total}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">POINTS</p>
                                                <p className="text-lg font-bold text-yellow-500 dark:text-yellow-400">⭐ {item.points}</p>
                                            </div>
                                            <div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${getBarColor(percentage)}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">{percentage}%</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Summary Stats */}
                    {filteredResults.length > 0 && (
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">TOTAL QUIZZES</p>
                                <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">{filteredResults.length}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">AVG SCORE</p>
                                <p className="text-3xl font-bold text-green-500 dark:text-green-400">
                                    {Math.round(filteredResults.reduce((sum, item) => sum + getScorePercentage(item.score, item.total), 0) / filteredResults.length)}%
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">TOTAL POINTS</p>
                                <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">
                                    ⭐ {filteredResults.reduce((sum, item) => sum + item.points, 0)}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

import { useState } from 'react';

export default function HistoryPage({ onNavigate }) {
    const [filterSubject, setFilterSubject] = useState('all');

    const historyData = [
        { id: 1, subject: 'Addition', level: 'Beginner', score: 5, maxScore: 5, date: 'Today', time: '2:30 PM', duration: '3:45' },
        { id: 2, subject: 'Subtraction', level: 'Intermediate', score: 4, maxScore: 5, date: 'Today', time: '1:15 PM', duration: '4:20' },
        { id: 3, subject: 'Multiplication', level: 'Beginner', score: 5, maxScore: 5, date: 'Yesterday', time: '5:00 PM', duration: '2:50' },
        { id: 4, subject: 'Division', level: 'Advanced', score: 3, maxScore: 5, date: 'Yesterday', time: '3:45 PM', duration: '5:30' },
        { id: 5, subject: 'Addition', level: 'Intermediate', score: 4, maxScore: 5, date: '2 days ago', time: '6:00 PM', duration: '4:15' },
        { id: 6, subject: 'Fractions', level: 'Beginner', score: 5, maxScore: 5, date: '3 days ago', time: '4:30 PM', duration: '3:10' },
        { id: 7, subject: 'Percentages', level: 'Intermediate', score: 2, maxScore: 5, date: '4 days ago', time: '2:00 PM', duration: '4:45' },
    ];

    const subjects = ['all', 'Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions', 'Percentages'];

    const filteredHistory = filterSubject === 'all'
        ? historyData
        : historyData.filter(item => item.subject === filterSubject);

    const getScorePercentage = (score, maxScore) => Math.round((score / maxScore) * 100);

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getBarColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Quiz History 📚</h1>

            {/* Filter Buttons */}
            <div className="mb-6">
                <p className="text-gray-400 text-sm mb-3 font-semibold">FILTER BY SUBJECT</p>
                <div className="flex flex-wrap gap-2">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setFilterSubject(subject)}
                            className={`px-4 py-2 rounded-lg transition-all font-semibold capitalize text-sm ${
                                filterSubject === subject
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-blue-500'
                            }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            {/* History List */}
            <div className="space-y-3">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No history found for this subject</p>
                    </div>
                ) : (
                    filteredHistory.map(item => {
                        const percentage = getScorePercentage(item.score, item.maxScore);
                        return (
                            <div
                                key={item.id}
                                className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <h3 className="text-lg font-bold text-gray-100">{item.subject}</h3>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {item.level} &middot; {item.date} at {item.time}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-1">SCORE</p>
                                        <p className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                                            {item.score}/{item.maxScore}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-1">TIME</p>
                                        <p className="text-lg font-bold text-gray-100">{item.duration}</p>
                                    </div>
                                    <div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${getBarColor(percentage)}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 text-right">{percentage}%</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary Stats */}
            {filteredHistory.length > 0 && (
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center">
                        <p className="text-gray-400 text-xs mb-1">TOTAL QUIZZES</p>
                        <p className="text-3xl font-bold text-blue-400">{filteredHistory.length}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center">
                        <p className="text-gray-400 text-xs mb-1">AVG SCORE</p>
                        <p className="text-3xl font-bold text-green-400">
                            {Math.round(filteredHistory.reduce((sum, item) => sum + getScorePercentage(item.score, item.maxScore), 0) / filteredHistory.length)}%
                        </p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center">
                        <p className="text-gray-400 text-xs mb-1">TOTAL POINTS</p>
                        <p className="text-3xl font-bold text-yellow-400">
                            {filteredHistory.reduce((sum, item) => sum + item.score, 0)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

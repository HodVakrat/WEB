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

    const getScorePercentage = (score, maxScore) => {
        return Math.round((score / maxScore) * 100);
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">📚 Quiz History</h1>
                <button 
                    onClick={() => onNavigate && onNavigate('dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Filter Buttons */}
            <div className="mb-8">
                <p className="text-gray-400 text-sm mb-4 font-semibold">FILTER BY SUBJECT</p>
                <div className="flex flex-wrap gap-2">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setFilterSubject(subject)}
                            className={`px-4 py-2 rounded-lg transition-all font-semibold capitalize ${
                                filterSubject === subject
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-blue-500'
                            }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
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
                                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all cursor-pointer"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                    {/* Subject and Level */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-lg font-bold text-gray-100">{item.subject}</h3>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {item.level} • {item.date} at {item.time}
                                        </p>
                                    </div>

                                    {/* Score */}
                                    <div className="text-center">
                                        <p className="text-sm text-gray-400 mb-1">SCORE</p>
                                        <p className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                                            {item.score}/{item.maxScore}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                                    </div>

                                    {/* Duration */}
                                    <div className="text-center">
                                        <p className="text-sm text-gray-400 mb-1">DURATION</p>
                                        <p className="text-lg font-bold text-gray-100">
                                            {item.duration}
                                        </p>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all ${
                                                    percentage >= 80 ? 'bg-green-500' : 
                                                    percentage >= 60 ? 'bg-yellow-500' : 
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-right">{percentage}%</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary Stats */}
            {filteredHistory.length > 0 && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                        <p className="text-gray-400 text-sm mb-2">TOTAL QUIZZES</p>
                        <p className="text-4xl font-bold text-blue-400">{filteredHistory.length}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                        <p className="text-gray-400 text-sm mb-2">AVERAGE SCORE</p>
                        <p className="text-4xl font-bold text-green-400">
                            {Math.round(
                                filteredHistory.reduce((sum, item) => sum + getScorePercentage(item.score, item.maxScore), 0) / 
                                filteredHistory.length
                            )}%
                        </p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                        <p className="text-gray-400 text-sm mb-2">TOTAL POINTS</p>
                        <p className="text-4xl font-bold text-yellow-400">
                            {filteredHistory.reduce((sum, item) => sum + item.score, 0)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

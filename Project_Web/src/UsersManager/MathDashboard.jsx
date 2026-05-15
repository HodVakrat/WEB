import { useState } from 'react';

export default function MathDashboard({ onNavigate }) {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);

    const subjects = [
        { id: 'addition', label: 'Addition', icon: '➕' },
        { id: 'subtraction', label: 'Subtraction', icon: '➖' },
        { id: 'multiplication', label: 'Multiplication', icon: '✖️' },
        { id: 'division', label: 'Division', icon: '➗' },
        { id: 'fractions', label: 'Fractions', icon: '🍕' },
        { id: 'percentages', label: 'Percentages', icon: '💯' },
    ];

    const levels = [
        { id: 'beginner', label: 'Beginner', icon: '🌱' },
        { id: 'intermediate', label: 'Intermediate', icon: '🌿' },
        { id: 'advanced', label: 'Advanced', icon: '🌳' },
    ];

    const handleStartQuiz = () => {
        if (selectedSubject && selectedLevel) {
            const subjectLabel = subjects.find(s => s.id === selectedSubject)?.label || 'Addition';
            const levelLabel = levels.find(l => l.id === selectedLevel)?.label || 'Beginner';
            onNavigate && onNavigate('quiz', { 
                subject: subjectLabel, 
                level: levelLabel 
            });
        } else {
            alert('Please select a subject and level');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Welcome Header */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">🐱</span>
                    <div>
                        <p className="text-gray-400 text-sm">Welcome back,</p>
                        <h1 className="text-3xl font-bold">ilya</h1>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-gray-400 text-sm">Your points</p>
                    <p className="text-3xl font-bold text-yellow-400 flex items-center gap-2">⭐ 0</p>
                </div>
            </div>

            {/* Pick a Subject */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-100">Pick a subject</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject.id)}
                            className={`p-6 rounded-lg border-2 transition-all ${
                                selectedSubject === subject.id
                                    ? 'bg-blue-600 border-blue-500'
                                    : 'bg-gray-800 border-gray-700 hover:border-blue-500'
                            }`}
                        >
                            <div className="text-4xl mb-3">{subject.icon}</div>
                            <p className="font-semibold text-gray-100">{subject.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Pick your Level */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-100">Pick your level</h2>
                <div className="grid grid-cols-3 gap-4">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            onClick={() => setSelectedLevel(level.id)}
                            className={`p-6 rounded-lg border-2 transition-all ${
                                selectedLevel === level.id
                                    ? 'bg-blue-600 border-blue-500'
                                    : 'bg-gray-800 border-gray-700 hover:border-blue-500'
                            }`}
                        >
                            <div className="text-4xl mb-3">{level.icon}</div>
                            <p className="font-semibold text-gray-100">{level.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Start Quiz Button */}
            <button 
                onClick={handleStartQuiz}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 px-6 rounded-lg mb-4 transition-colors">
                Start Quiz
            </button>

            {/* Bottom Navigation */}
            <div className="grid grid-cols-3 gap-4">
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Store
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('history')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    History
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('login')}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

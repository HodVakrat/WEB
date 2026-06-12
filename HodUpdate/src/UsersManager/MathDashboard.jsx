import { useState } from 'react';

export default function MathDashboard({ profile, onNavigate, onBackToParent }) {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);

    if (!profile) {
        return <p className="text-gray-400 italic p-6">No profile selected.</p>;
    }

    const subjects = [
        { id: 'addition', label: 'Addition', icon: '➕' },
        { id: 'subtraction', label: 'Subtraction', icon: '➖' },
        { id: 'multiplication', label: 'Multiplication', icon: '✖️' },
        { id: 'division', label: 'Division', icon: '➗' },
        { id: 'fractions', label: 'Fractions', icon: '🍕' },
        { id: 'percentages', label: 'Percentages', icon: '💯' },
    ];

    const levels = [
        { id: 'beginner', label: 'Beginner', icon: '🌱', desc: '30 seconds' },
        { id: 'intermediate', label: 'Intermediate', icon: '🌿', desc: '90 seconds' },
        { id: 'advanced', label: 'Advanced', icon: '🌳', desc: '150 seconds' },
    ];

    const handleStartQuiz = () => {
        if (selectedSubject && selectedLevel) {
            const subjectLabel = subjects.find(s => s.id === selectedSubject)?.label || 'Addition';
            const levelLabel = levels.find(l => l.id === selectedLevel)?.label || 'Beginner';
            onNavigate && onNavigate('quiz', { subject: subjectLabel, level: levelLabel });
        } else {
            alert('Please select a subject and level');
        }
    };

    return (
        <div className="p-6">
            {/* Welcome Header */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-5xl">{profile.avatar}</span>
                    <div>
                        <p className="text-gray-400 text-sm">Welcome back,</p>
                        <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-gray-400 text-sm">Your coins</p>
                    <p className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                        <span>⭐</span> {profile.coins}
                    </p>
                </div>
            </div>

            {/* Pick a Subject */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-100">Pick a subject</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject.id)}
                            className={`p-5 rounded-xl border-2 transition-all text-center ${
                                selectedSubject === subject.id
                                    ? 'bg-blue-600 border-blue-500 scale-[1.02]'
                                    : 'bg-gray-800 border-gray-700 hover:border-blue-500'
                            }`}
                        >
                            <div className="text-3xl mb-2">{subject.icon}</div>
                            <p className="font-semibold text-gray-100">{subject.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Pick your Level */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-100">Pick your level</h2>
                <div className="grid grid-cols-3 gap-4">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            onClick={() => setSelectedLevel(level.id)}
                            className={`p-5 rounded-xl border-2 transition-all text-center ${
                                selectedLevel === level.id
                                    ? 'bg-blue-600 border-blue-500 scale-[1.02]'
                                    : 'bg-gray-800 border-gray-700 hover:border-blue-500'
                            }`}
                        >
                            <div className="text-3xl mb-2">{level.icon}</div>
                            <p className="font-semibold text-gray-100">{level.label}</p>
                            <p className="text-xs text-gray-400 mt-1">{level.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Start Quiz Button */}
            <button
                onClick={handleStartQuiz}
                disabled={!selectedSubject || !selectedLevel}
                className={`w-full font-bold py-4 px-6 rounded-xl mb-6 transition-all text-lg ${
                    selectedSubject && selectedLevel
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
                {selectedSubject && selectedLevel ? '🚀 Start Quiz!' : 'Select a subject and level to start'}
            </button>
        </div>
    );
}

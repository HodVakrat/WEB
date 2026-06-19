import { useState } from 'react';

export default function MathDashboard({ profile, onNavigate, onBackToParent }) {
    const [selectedSubject, setSelectedSubject] = useState(null);

    if (!profile) {
        return <p className="text-gray-500 dark:text-gray-400 italic p-6">No profile selected.</p>;
    }

    const getAge = (birthday) => {
        const birth = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const age = profile.birthday ? getAge(profile.birthday) : 11;

    const allSubjects = [
        { id: 'addition', label: 'Addition', icon: '➕', minAge: 7 },
        { id: 'subtraction', label: 'Subtraction', icon: '➖', minAge: 7 },
        { id: 'multiplication', label: 'Multiplication', icon: '✖️', minAge: 9 },
        { id: 'division', label: 'Division', icon: '➗', minAge: 9 },
        { id: 'fractions', label: 'Fractions', icon: '🍕', minAge: 11 },
        { id: 'percentages', label: 'Percentages', icon: '💯', minAge: 11 },
    ];

    const subjects = allSubjects.filter(s => age >= s.minAge);

    const handleStartQuiz = () => {
        if (selectedSubject) {
            const subjectLabel = subjects.find(s => s.id === selectedSubject)?.label || 'Addition';
            onNavigate && onNavigate('quiz', { subject: subjectLabel });
        } else {
            alert('Please select a subject');
        }
    };

    return (
        <div className="p-6">
            {/* Welcome Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-5xl">{profile.avatar}</span>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back,</p>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Age: {age}</p>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Your coins</p>
                    <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400 flex items-center gap-2">
                        <span>⭐</span> {profile.coins}
                    </p>
                </div>
            </div>

            {/* Pick a Subject */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Pick a subject</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject.id)}
                            className={`p-5 rounded-xl border-2 transition-all text-center ${
                                selectedSubject === subject.id
                                    ? 'bg-blue-600 border-blue-500 scale-[1.02] text-white'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                            }`}
                        >
                            <div className="text-3xl mb-2">{subject.icon}</div>
                            <p className={`font-semibold ${selectedSubject === subject.id ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{subject.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Start Quiz Button */}
            <button
                onClick={handleStartQuiz}
                disabled={!selectedSubject}
                className={`w-full font-bold py-4 px-6 rounded-xl mb-6 transition-all text-lg ${
                    selectedSubject
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
            >
                {selectedSubject ? '🚀 Start Quiz!' : 'Select a subject to start'}
            </button>
        </div>
    );
}

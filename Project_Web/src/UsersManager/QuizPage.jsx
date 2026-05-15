import { useState } from 'react';

export default function QuizPage({ subject = 'Addition', level = 'Beginner' }) {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft] = useState(53);

    const quizData = {
        question: '5 - 1 = ?',
        correctAnswer: 4,
        options: [4, 0, 2, 6],
    };

    const handleAnswerClick = (answer) => {
        setSelectedAnswer(answer);
        if (answer === quizData.correctAnswer) {
            setScore(score + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Header Stats */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-gray-400 text-sm font-semibold">QUESTION</p>
                    <p className="text-3xl font-bold">1 / 5</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm font-semibold">TIME</p>
                    <p className="text-3xl font-bold text-blue-400">{timeLeft}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm font-semibold">SCORE</p>
                    <p className="text-3xl font-bold flex items-center justify-center gap-2">
                        <span>⭐</span>
                        <span className="text-red-400">{score}</span>
                    </p>
                </div>
            </div>

            {/* Quiz Container */}
            <div className="bg-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
                {/* Subject and Level */}
                <div className="text-center mb-8 text-gray-400">
                    <p className="flex items-center justify-center gap-2">
                        <span>➖</span>
                        <span>{subject}</span>
                        <span>·</span>
                        <span>🌱</span>
                        <span>{level}</span>
                    </p>
                </div>

                {/* Question */}
                <h2 className="text-5xl font-bold text-center mb-12 text-gray-100">
                    {quizData.question}
                </h2>

                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-6">
                    {quizData.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerClick(option)}
                            className={`p-8 rounded-lg border-2 transition-all text-3xl font-bold ${
                                selectedAnswer === option
                                    ? option === quizData.correctAnswer
                                        ? 'bg-green-600 border-green-500 text-white'
                                        : 'bg-red-600 border-red-500 text-white'
                                    : 'bg-gray-700 border-gray-600 text-gray-100 hover:border-blue-400'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Help Button */}
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                <span>🤖</span>
                <span>Need help? Ask the bot</span>
            </button>
        </div>
    );
}

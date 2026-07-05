import { useState, useEffect } from 'react';
import { generateOneQuestion, isCorrect, LEVELS, QUESTIONS_PER_QUIZ } from '../logic/QuizLogic';
import { saveQuizResult } from '../services/ResultService';
import BotHelper from './BotHelper';

const LEVEL_LABELS = { beginner: 'Easy', intermediate: 'Medium', advanced: 'Hard' };
const LEVEL_COLORS = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500',
};
const STREAK_TO_CHANGE = 2;
const ANIMATION_DURATION = 2000;

const TIME_LIMITS = {
    beginner: 30,
    intermediate: 90,
    advanced: 150,
};

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const CORRECT_MESSAGES = [
    { emoji: '🌟', text: 'Amazing!' },
    { emoji: '🎉', text: 'Great job!' },
    { emoji: '🏆', text: 'You rock!' },
    { emoji: '💪', text: 'Super smart!' },
    { emoji: '🚀', text: 'Awesome!' },
    { emoji: '✨', text: 'Brilliant!' },
    { emoji: '🤩', text: 'Wow!' },
];

const WRONG_MESSAGES = [
    { emoji: '💪', text: 'Keep trying!' },
    { emoji: '🌈', text: 'Almost there!' },
    { emoji: '🤔', text: "You'll get it!" },
    { emoji: '🌱', text: 'Keep growing!' },
    { emoji: '😊', text: "That's okay!" },
];

const TIMEOUT_MESSAGES = [
    { emoji: '⏰', text: 'Time ran out!' },
    { emoji: '🐢', text: 'Too slow this time!' },
    { emoji: '⌛', text: "Try faster next time!" },
];

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function QuizPage({ subject = 'Addition', profileId, avatar, onNavigate, onCoinsUpdated }) {
    const [levelIndex, setLevelIndex] = useState(0);
    const [question, setQuestion] = useState(() => generateOneQuestion(subject, LEVELS[0]));
    const [questionNumber, setQuestionNumber] = useState(1);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timedOut, setTimedOut] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [streak, setStreak] = useState(0);
    const [saved, setSaved] = useState(false);
    const [earned, setEarned] = useState(0);
    const [questionLevels, setQuestionLevels] = useState([LEVELS[0]]);
    const [correctLevels, setCorrectLevels] = useState([]);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[LEVELS[0]]);
    const [animation, setAnimation] = useState(null);
    const [paused, setPaused] = useState(false);

    /*
     * Bot-help tracking ("no coins on assisted questions"):
     * helpUsed        - the kid confirmed Hint/Answer on the CURRENT question,
     *                   so a correct answer here earns no coins. Resets per question.
     * assistedCorrect - how many correct answers in this quiz used help. Sent to
     *                   the server so it can validate score without awarding coins
     *                   for these answers.
     */
    const [helpUsed, setHelpUsed] = useState(false);
    const [assistedCorrect, setAssistedCorrect] = useState(0);

    const currentLevel = LEVELS[levelIndex];
    const locked = selectedAnswer !== null || timedOut;
    const animating = animation !== null;

    useEffect(() => {
        if (locked || animating || paused) return;
        if (timeLeft <= 0) {
            setTimedOut(true);
            setAnimation({ type: 'timeout', ...pickRandom(TIMEOUT_MESSAGES) });
            return;
        }
        const timerId = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timerId);
    }, [timeLeft, locked, animating, paused]);

    useEffect(() => {
        if (!animating) return;
        const timerId = setTimeout(() => setAnimation(null), ANIMATION_DURATION);
        return () => clearTimeout(timerId);
    }, [animating]);

    useEffect(() => {
        if (!finished || saved) return;
        setSaved(true);
        if (!profileId) return;
        saveQuizResult({ profileId, subject, level: 'adaptive', score, total: QUESTIONS_PER_QUIZ, questionLevels, correctLevels, assistedCorrect })
            .then(({ result, coins }) => {
                setEarned(result.points);
                onCoinsUpdated && onCoinsUpdated(coins);
            })
            .catch((err) => console.error('Failed to save result:', err.message));
    }, [finished, saved, profileId, subject, score, onCoinsUpdated, questionLevels, correctLevels, assistedCorrect]);

    const handleAnswerClick = (answer) => {
        if (locked || paused) return;
        setSelectedAnswer(answer);

        const correct = isCorrect(question, answer);
        let newStreak = streak;
        let newLevelIndex = levelIndex;

        if (correct) {
            setScore((prev) => prev + 1);
            /*
             * Coins are earned only for correct answers WITHOUT bot help:
             * - no help  -> record the question's difficulty in correctLevels
             *               (the server sums coins from this array).
             * - help used -> count it in assistedCorrect instead, so the server
             *               can still validate the score but awards no coins.
             * Score, streak, and the adaptive level are NOT affected by help.
             */
            if (helpUsed) {
                setAssistedCorrect((prev) => prev + 1);
            } else {
                setCorrectLevels((prev) => [...prev, currentLevel]);
            }
            newStreak = streak >= 0 ? streak + 1 : 1;
            setAnimation({ type: 'correct', ...pickRandom(CORRECT_MESSAGES) });
        } else {
            newStreak = streak <= 0 ? streak - 1 : -1;
            setAnimation({ type: 'wrong', ...pickRandom(WRONG_MESSAGES) });
        }

        if (newStreak >= STREAK_TO_CHANGE && levelIndex < LEVELS.length - 1) {
            newLevelIndex = levelIndex + 1;
            newStreak = 0;
        } else if (newStreak <= -STREAK_TO_CHANGE && levelIndex > 0) {
            newLevelIndex = levelIndex - 1;
            newStreak = 0;
        }

        setStreak(newStreak);
        setLevelIndex(newLevelIndex);
    };

    const handleNext = () => {
        if (questionNumber >= QUESTIONS_PER_QUIZ) {
            setFinished(true);
            return;
        }
        const nextLevel = LEVELS[levelIndex];
        const nextQ = generateOneQuestion(subject, nextLevel);
        setQuestion(nextQ);
        setQuestionNumber((n) => n + 1);
        setSelectedAnswer(null);
        setTimedOut(false);
        setPaused(false);
        setHelpUsed(false);
        setQuestionLevels((prev) => [...prev, nextLevel]);
        setTimeLeft(TIME_LIMITS[nextLevel]);
    };

    const handleRestart = () => {
        setLevelIndex(0);
        setQuestion(generateOneQuestion(subject, LEVELS[0]));
        setQuestionNumber(1);
        setSelectedAnswer(null);
        setTimedOut(false);
        setScore(0);
        setFinished(false);
        setStreak(0);
        setSaved(false);
        setEarned(0);
        setQuestionLevels([LEVELS[0]]);
        setCorrectLevels([]);
        setTimeLeft(TIME_LIMITS[LEVELS[0]]);
        setAnimation(null);
        setPaused(false);
        setHelpUsed(false);
        setAssistedCorrect(0);
    };

    const getOptionClass = (option) => {
        if (!locked) {
            return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:border-blue-400';
        }
        if (option === question.correctAnswer) {
            return 'bg-green-600 border-green-500 text-white';
        }
        if (option === selectedAnswer) {
            return 'bg-red-600 border-red-500 text-white';
        }
        return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 opacity-60';
    };

    if (finished) {
        const maxLevel = LEVELS[Math.max(...questionLevels.map(l => LEVELS.indexOf(l)))];
        return (
            <div className="text-gray-900 dark:text-white p-6 flex items-center justify-center min-h-[60vh]">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 border border-gray-200 dark:border-gray-700 text-center max-w-md w-full shadow-xl">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Your score</p>
                    <p className="text-5xl font-bold text-yellow-500 dark:text-yellow-400 mb-2">
                        {score} / {QUESTIONS_PER_QUIZ}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Highest level reached: <span className="font-bold text-gray-800 dark:text-gray-200">{LEVEL_LABELS[maxLevel]}</span>
                    </p>
                    <p className="text-xl text-yellow-600 dark:text-yellow-300 mb-8">You earned {earned} coins ⭐</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleRestart}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => onNavigate && onNavigate('dashboard')}
                            className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="text-gray-900 dark:text-white p-6 relative">
            {/* Feedback animation overlay */}
            {animating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className={`text-center animate-bounce-feedback ${
                        animation.type === 'correct' ? 'feedback-correct' : animation.type === 'wrong' ? 'feedback-wrong' : 'feedback-timeout'
                    }`}>
                        <div className="text-8xl mb-4 animate-spin-slow">{animation.emoji}</div>
                        <p className="text-4xl font-extrabold drop-shadow-lg">{animation.text}</p>
                        {animation.type === 'correct' && (
                            <div className="mt-4 flex justify-center gap-2">
                                {['⭐', '🌟', '✨', '🌟', '⭐'].map((s, i) => (
                                    <span key={i} className="text-3xl animate-sparkle" style={{ animationDelay: `${i * 0.15}s` }}>{s}</span>
                                ))}
                            </div>
                        )}
                        {animation.type === 'wrong' && (
                            <p className="mt-3 text-lg font-semibold opacity-80">You can do it! 💪</p>
                        )}
                    </div>
                </div>
            )}

            {/* Header stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">QUESTION</p>
                    <p className="text-3xl font-bold">{questionNumber} / {QUESTIONS_PER_QUIZ}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">TIME</p>
                    <p className={`text-3xl font-bold ${paused ? 'text-amber-500 dark:text-amber-400' : timeLeft <= 10 ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                        {paused ? '⏸' : formatTime(timeLeft)}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">LEVEL</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-white text-sm font-bold ${LEVEL_COLORS[currentLevel]}`}>
                        {LEVEL_LABELS[currentLevel]}
                    </span>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">CORRECT ANSWERS</p>
                    <p className="text-3xl font-bold">{score}</p>
                </div>
            </div>

            {/* Quiz + Buddy layout */}
            <div className="flex gap-6">
                {/* Quiz area */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="text-center mb-8 text-gray-500 dark:text-gray-400">
                            <p>{subject}</p>
                        </div>

                        <h2 className="text-5xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
                            {question.question}
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            {question.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerClick(option)}
                                    disabled={locked || paused}
                                    className={`p-8 rounded-lg border-2 transition-all text-3xl font-bold ${getOptionClass(option)} ${paused && !locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {locked && !animating && !paused && (
                        <button
                            onClick={handleNext}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg mb-4 transition-colors"
                        >
                            {questionNumber < QUESTIONS_PER_QUIZ ? 'Next Question' : 'Finish'}
                        </button>
                    )}
                </div>

                {/* Buddy sidebar */}
                <div className="w-52 shrink-0">
                    <div className="sticky top-24">
                        <BotHelper
                            avatar={avatar}
                            currentQuestion={question}
                            questionNumber={questionNumber}
                            paused={paused}
                            onPause={() => setPaused(true)}
                            onResume={() => setPaused(false)}
                            locked={locked}
                            helpUsed={helpUsed}
                            onHelpUsed={() => setHelpUsed(true)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

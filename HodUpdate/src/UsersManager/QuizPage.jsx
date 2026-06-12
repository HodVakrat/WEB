import { useState, useEffect } from 'react';
import { generateQuestions, isCorrect } from '../logic/QuizLogic';
import { saveQuizResult } from '../services/ResultService';
import BotHelper from './BotHelper';

/*
 * Time limit (in seconds) per difficulty level.
 * easy 0:30, intermediate 1:30, advanced 2:30.
 */
const TIME_LIMITS = {
    beginner: 30,
    intermediate: 90,
    advanced: 150,
};

/*
 * Format a number of seconds as "M:SS" (e.g. 90 -> "1:30", 30 -> "0:30").
 */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function QuizPage({ subject = 'Addition', level = 'Beginner', profileId, onNavigate, onCoinsUpdated }) {
    // How long each question gets, based on the chosen level (defaults to 30s).
    const timeLimit = TIME_LIMITS[String(level).toLowerCase()] ?? 30;

    /*
     * State.
     * questions      - the 5 questions for this session, built ONCE from QuizLogic.
     * current        - index of the question currently shown.
     * selectedAnswer - what the child clicked for the current question (null = not clicked).
     * timedOut       - true if the current question's time ran out before answering.
     * score          - number of correct answers so far.
     * finished       - true once the last question is done.
     * timeLeft       - seconds remaining on the current question.
     */
    const [questions, setQuestions] = useState(() => generateQuestions(subject, level));
    const [current, setCurrent] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timedOut, setTimedOut] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    // Result-saving state: save exactly once, and remember the coins earned.
    const [saved, setSaved] = useState(false);
    const [earned, setEarned] = useState(0);
    const [showBot, setShowBot] = useState(false);

    const question = questions[current];
    // A question is "locked" once it was answered OR its time ran out.
    const locked = selectedAnswer !== null || timedOut;

    /*
     * Countdown for the current question. Ticks one second at a time while the
     * question is open; when it reaches zero it marks the question as timed out.
     * clearTimeout in the cleanup prevents overlapping timers / leaks.
     * NOTE: the clock is reset to the level's limit inside handleNext / handleRestart
     * (synchronously, in the same click) — NOT in an effect. Resetting here would let
     * a freshly shown question briefly still see the previous question's "0" and
     * instantly mark itself as timed out.
     */
    useEffect(() => {
        if (locked) return;
        if (timeLeft <= 0) {
            setTimedOut(true);
            return;
        }
        const timerId = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timerId);
    }, [timeLeft, locked]);

    /*
     * Save the result ONCE when the quiz finishes. The server stores it,
     * computes the points, and returns the new coin balance, which we push
     * up so the dashboard / parent screen show the updated wallet.
     */
    useEffect(() => {
        if (!finished || saved) return;
        setSaved(true); // guard against a second save (would double the coins)
        if (!profileId) return; // opened without a profile (dev nav) -> skip saving
        saveQuizResult({ profileId, subject, level, score, total: questions.length })
            .then(({ result, coins }) => {
                setEarned(result.points);
                onCoinsUpdated && onCoinsUpdated(coins);
            })
            .catch((err) => console.error('Failed to save result:', err.message));
    }, [finished, saved, profileId, subject, level, score, questions.length, onCoinsUpdated]);

    /*
     * Handle an answer click. Ignored once the question is locked. Asks QuizLogic
     * whether the answer is correct before updating the score.
     */
    const handleAnswerClick = (answer) => {
        if (locked) return;
        setSelectedAnswer(answer);
        if (isCorrect(question, answer)) {
            setScore((prev) => prev + 1);
        }
    };

    /*
     * Move to the next question (clearing answer + timeout), or finish the quiz.
     */
    const handleNext = () => {
        if (current + 1 < questions.length) {
            setCurrent((prev) => prev + 1);
            setSelectedAnswer(null);
            setTimedOut(false);
            setTimeLeft(timeLimit); // reset the clock in the same click as the new question
        } else {
            setFinished(true);
        }
    };

    /*
     * Restart: fresh questions and a full reset of progress and clock.
     */
    const handleRestart = () => {
        setQuestions(generateQuestions(subject, level));
        setCurrent(0);
        setSelectedAnswer(null);
        setTimedOut(false);
        setScore(0);
        setFinished(false);
        setTimeLeft(timeLimit);
        setSaved(false);
        setEarned(0);
    };

    /*
     * Colour of an option button based on the answer state.
     * Open: neutral. Locked: correct option green, chosen-wrong option red, rest dim.
     */
    const getOptionClass = (option) => {
        if (!locked) {
            return 'bg-gray-700 border-gray-600 text-gray-100 hover:border-blue-400';
        }
        if (option === question.correctAnswer) {
            return 'bg-green-600 border-green-500 text-white';
        }
        if (option === selectedAnswer) {
            return 'bg-red-600 border-red-500 text-white';
        }
        return 'bg-gray-700 border-gray-600 text-gray-400 opacity-60';
    };

    /*
     * Finished view: a simple summary shown after the last question.
     * (A richer dedicated Results screen is a later step.)
     */
    if (finished) {
        return (
            <div className="text-white p-6 flex items-center justify-center min-h-[60vh]">
                <div className="bg-gray-800 rounded-2xl p-10 border border-gray-700 text-center max-w-md w-full shadow-xl">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
                    <p className="text-gray-400 mb-2">Your score</p>
                    <p className="text-5xl font-bold text-yellow-400 mb-2">
                        {score} / {questions.length}
                    </p>
                    <p className="text-xl text-yellow-300 mb-8">You earned {earned} coins ⭐</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleRestart}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => onNavigate && onNavigate('dashboard')}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * Active quiz view.
     */
    return (
        <div className="text-white p-6">
            {/* Header stats: question progress, countdown, score */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-gray-400 text-sm font-semibold">QUESTION</p>
                    <p className="text-3xl font-bold">{current + 1} / {questions.length}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm font-semibold">TIME</p>
                    {/* Turns red in the final 10 seconds */}
                    <p className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`}>
                        {formatTime(timeLeft)}
                    </p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm font-semibold">SCORE</p>
                    <p className="text-3xl font-bold flex items-center justify-center gap-2">
                        <span>⭐</span>
                        <span className="text-yellow-400">{score}</span>
                    </p>
                </div>
            </div>

            {/* Quiz container */}
            <div className="bg-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
                {/* Subject and level */}
                <div className="text-center mb-8 text-gray-400">
                    <p>{subject} · {level}</p>
                </div>

                {/* Question */}
                <h2 className="text-5xl font-bold text-center mb-12 text-gray-100">
                    {question.question}
                </h2>

                {/* "Time's up" notice (only when the clock ran out) */}
                {timedOut && (
                    <p className="text-center text-red-400 font-semibold mb-6">⏰ Time's up!</p>
                )}

                {/* Answer options */}
                <div className="grid grid-cols-2 gap-6">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerClick(option)}
                            disabled={locked}
                            className={`p-8 rounded-lg border-2 transition-all text-3xl font-bold ${getOptionClass(option)}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Next / Finish button — shown once the question is locked */}
            {locked && (
                <button
                    onClick={handleNext}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg mb-4 transition-colors"
                >
                    {current + 1 < questions.length ? 'Next Question' : 'Finish'}
                </button>
            )}

            {/* Help button */}
            <button
                onClick={() => setShowBot(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <span>🤖</span>
                <span>Need help? Ask the bot</span>
            </button>

            {showBot && (
                <BotHelper
                    currentQuestion={question}
                    onClose={() => setShowBot(false)}
                />
            )}
        </div>
    );
}

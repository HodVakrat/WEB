import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

const API_KEY = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Preferred model first, then progressively lighter fallbacks. On the free tier
// gemini-2.5-flash is frequently throttled (503), so we fall back to the -lite
// models, which have far more available free-tier capacity.
const MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest'];
const models = MODEL_CHAIN.map((name) => genAI.getGenerativeModel({ model: name }));

const SYSTEM_PROMPT = `You are a friendly and kind math helper for young children. Your name is "MathBuddy".
Important rules:
- Use simple and warm language suitable for young children
- Use emojis to make it fun 🌟
- When asked for a hint: give only a small hint that helps the child think on their own, without giving away the answer!
- When asked for a solution: explain the solution step by step in a simple and encouraging way
- Always encourage the child and tell them they are doing a great job
- Keep your answers short (2-3 sentences max)
- Always answer in English`;

// gemini-2.5-flash on the free tier intermittently returns 503 UNAVAILABLE
// ("high demand") or 429 RESOURCE_EXHAUSTED. These are transient — a single
// attempt fails often, but a retry usually succeeds.
function isTransientOverload(err) {
    const status = err?.status ?? err?.response?.status;
    if (status === 503 || status === 429) return true;
    const msg = String(err?.message || err || '').toLowerCase();
    return /503|429|unavailable|overloaded|high demand|resource_exhausted|rate limit/.test(msg);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Try each model in MODEL_CHAIN. For each, retry a couple of times on transient
// overload (503/429) before falling back to the next, lighter model. Non-transient
// errors (bad key, invalid request) fail fast so they surface for debugging.
async function generateWithRetry(prompt, { retriesPerModel = 2, baseDelay = 700 } = {}) {
    let lastErr;
    for (const m of models) {
        for (let attempt = 0; attempt <= retriesPerModel; attempt++) {
            try {
                const result = await m.generateContent(prompt);
                return result.response.text();
            } catch (err) {
                lastErr = err;
                if (!isTransientOverload(err)) throw err; // real error → stop
                if (attempt < retriesPerModel) {
                    await sleep(baseDelay * 2 ** attempt); // 0.7s, 1.4s
                    continue;
                }
                // exhausted retries for this model → fall back to the next
            }
        }
    }
    throw lastErr;
}

export default function BotHelper({ avatar, currentQuestion, questionNumber, paused, onPause, onResume, locked, helpUsed, onHelpUsed }) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hintGiven, setHintGiven] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(null);
    const [prevQuestionNumber, setPrevQuestionNumber] = useState(questionNumber);

    // Reset the bot on every new question by questionNumber — NOT by question text,
    // since some questions (e.g. "Which fraction is the largest?") legitimately
    // repeat the same text, which would skip the reset and bypass the hint gate.
    if (questionNumber !== prevQuestionNumber) {
        setPrevQuestionNumber(questionNumber);
        setMessages([]);
        setHintGiven(false);
        setShowConfirm(false);
        setPendingRequest(null);
    }

    /*
     * Entry point for the Hint/Answer buttons ("no coins on assisted questions"):
     * the FIRST help request on a question opens a confirmation pop-up (and freezes
     * the timer) instead of calling the AI directly. Confirming forfeits the coins
     * for this question (onHelpUsed) and then runs the normal help flow. Once help
     * was already confirmed on this question, further clicks skip the pop-up —
     * the price was already paid.
     */
    const handleHelpClick = (requestType) => {
        if (!helpUsed) {
            setPendingRequest(requestType);
            setShowConfirm(true);
            onPause && onPause();
            return;
        }
        askBot(requestType);
    };

    const handleConfirmHelp = () => {
        setShowConfirm(false);
        onHelpUsed && onHelpUsed();
        askBot(pendingRequest);
        setPendingRequest(null);
    };

    const handleCancelHelp = () => {
        // No penalty: close the pop-up and let the clock run again.
        setShowConfirm(false);
        setPendingRequest(null);
        onResume && onResume();
    };

    const askBot = async (requestType) => {
        // Asking for help freezes the quiz timer until the child clicks "Continue".
        onPause && onPause();
        setIsLoading(true);

        let userPrompt;
        if (requestType === 'hint') {
            userPrompt = `The child needs a hint for this question: "${currentQuestion.question}"
Give a small and clever hint that helps them think on their own without revealing the answer. Be encouraging!`;
            setHintGiven(true);
        } else {
            userPrompt = `The child needs the full solution for this question: "${currentQuestion.question}"
The correct answer is: ${currentQuestion.correctAnswer}
Explain the solution step by step in a simple and encouraging way for a young child.`;
        }

        const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

        try {
            const text = await generateWithRetry(fullPrompt);
            setMessages((prev) => [
                ...prev,
                { role: requestType === 'hint' ? 'hint' : 'solution', text },
            ]);
        } catch (err) {
            // Surface the real cause instead of swallowing it — the free tier
            // frequently returns transient 503 (high demand) / 429 (quota) for
            // gemini-2.5-flash, which is otherwise invisible to debugging.
            console.error('Gemini request failed:', err);
            const overloaded = isTransientOverload(err);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'error',
                    text: overloaded
                        ? 'I\'m a bit busy right now 😅 Give me a moment and try again!'
                        : 'Oops! Something went wrong 😅 Try again!',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    return (
        <div className="flex flex-col items-center gap-3">
            {/*
             * Coin-forfeit confirmation pop-up. The full-screen backdrop blocks
             * every click behind it (including the "Continue" button), and
             * clicking the backdrop itself does nothing — the kid must pick one
             * of the two buttons. The quiz timer is already paused at this point.
             */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl max-w-sm w-full text-center">
                        <div className="text-5xl mb-3">💡</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            MathBuddy can help you!
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            But if you get help, you won't earn coins ⭐ for this question.
                            Do you still want help?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirmHelp}
                                className="flex-1 bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                            >
                                Yes, help me!
                            </button>
                            <button
                                onClick={handleCancelHelp}
                                className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors"
                            >
                                No thanks
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reminder that this question's coins were forfeited (until next question) */}
            {helpUsed && (
                <div className="w-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl px-3 py-1.5 text-center">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        💫 No coins for this question
                    </p>
                </div>
            )}

            {/* Speech bubble */}
            <div className="relative w-full">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 shadow-lg min-h-20 relative">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <span className="animate-bounce text-lg">🤔</span>
                            <span className="text-sm">Thinking...</span>
                        </div>
                    ) : latestMessage ? (
                        <div className="text-sm text-gray-800 dark:text-gray-100 prose prose-sm dark:prose-invert max-w-none">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span>{latestMessage.role === 'hint' ? '💡' : latestMessage.role === 'solution' ? '✅' : '⚠️'}</span>
                                <span className="text-xs font-bold text-purple-500 dark:text-purple-400 uppercase">{latestMessage.role}</span>
                            </div>
                            <ReactMarkdown>{latestMessage.text}</ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Hi! I'm your buddy! 👋<br />Need help? Click below!
                        </p>
                    )}
                    {/* Triangle pointer */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-700 border-b border-r border-gray-200 dark:border-gray-600 rotate-45"></div>
                </div>
            </div>

            {/* Continue — resumes the quiz timer (shown only while paused for bot
                help; hidden while the confirmation pop-up is open, since the pause
                belongs to the pop-up then) */}
            {paused && !showConfirm && (
                <button
                    onClick={() => onResume && onResume()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
                >
                    <span>▶️</span>
                    <span>Continue</span>
                </button>
            )}

            {/* Avatar character */}
            <div className="text-6xl animate-buddy-idle select-none">
                {avatar || '🤖'}
            </div>

            {/* Action buttons. Disabled once the question is locked (answered or
                timed out) — help is only available on a live question. */}
            <div className="flex gap-2 w-full">
                <button
                    onClick={() => handleHelpClick('hint')}
                    disabled={isLoading || locked}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-gray-900 font-bold py-2 px-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
                >
                    <span>💡</span>
                    <span>Hint</span>
                </button>
                <button
                    onClick={() => handleHelpClick('solution')}
                    disabled={isLoading || locked || !hintGiven}
                    className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
                    title={!hintGiven ? 'Try a hint first!' : ''}
                >
                    <span>✅</span>
                    <span>Answer</span>
                </button>
            </div>

            {/* Scroll through previous messages */}
            {messages.length > 1 && (
                <div className="w-full max-h-32 overflow-y-auto space-y-2">
                    {messages.slice(0, -1).map((msg, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-xs text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                            <span className="font-bold text-purple-500 dark:text-purple-400 uppercase mr-1">{msg.role}:</span>
                            <span>{msg.text.length > 80 ? msg.text.slice(0, 80) + '...' : msg.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

const API_KEY = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const SYSTEM_PROMPT = `You are a friendly and kind math helper for young children. Your name is "MathBuddy".
Important rules:
- Use simple and warm language suitable for young children
- Use emojis to make it fun 🌟
- When asked for a hint: give only a small hint that helps the child think on their own, without giving away the answer!
- When asked for a solution: explain the solution step by step in a simple and encouraging way
- Always encourage the child and tell them they are doing a great job
- Keep your answers short (2-3 sentences max)
- Always answer in English`;

export default function BotHelper({ avatar, currentQuestion }) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hintGiven, setHintGiven] = useState(false);
    const [prevQuestion, setPrevQuestion] = useState(currentQuestion?.question);

    if (currentQuestion?.question !== prevQuestion) {
        setPrevQuestion(currentQuestion?.question);
        setMessages([]);
        setHintGiven(false);
    }

    const askBot = async (requestType) => {
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
            const result = await model.generateContent(fullPrompt);
            const text = result.response.text();
            setMessages((prev) => [
                ...prev,
                { role: requestType === 'hint' ? 'hint' : 'solution', text },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'error', text: 'Oops! Something went wrong 😅 Try again!' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Speech bubble */}
            <div className="relative w-full">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 shadow-lg min-h-[80px] relative">
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

            {/* Avatar character */}
            <div className="text-6xl animate-buddy-idle select-none">
                {avatar || '🤖'}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full">
                <button
                    onClick={() => askBot('hint')}
                    disabled={isLoading}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-gray-900 font-bold py-2 px-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
                >
                    <span>💡</span>
                    <span>Hint</span>
                </button>
                <button
                    onClick={() => askBot('solution')}
                    disabled={isLoading || !hintGiven}
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

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

const API_KEY = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const SYSTEM_PROMPT = `You are a friendly and kind math helper for young children. Your name is "MathMagic".
Important rules:
- Use simple and warm language suitable for young children
- Use emojis to make it fun 🌟
- When asked for a hint: give only a small hint that helps the child think on their own, without giving away the answer!
- When asked for a solution: explain the solution step by step in a simple and encouraging way
- Always encourage the child and tell them they are doing a great job
- Keep your answers short and clear, don't make them too long
- Always answer in English`;

export default function BotHelper({ currentQuestion, onClose }) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hintGiven, setHintGiven] = useState(false);

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
                { role: requestType === 'hint' ? 'Hint' : 'Solution', text },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'Error', text: 'Oops! Something went wrong 😅 Try again!' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl border-2 border-purple-500 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="bg-purple-600 rounded-t-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">🤖</span>
                        <div>
                            <h3 className="text-white font-bold text-lg">MathMagic</h3>
                            <p className="text-purple-200 text-sm">Your smart helper!</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-300 text-2xl font-bold transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Question display */}
                <div className="bg-gray-700 mx-4 mt-4 p-3 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Your question:</p>
                    <p className="text-white text-2xl font-bold">{currentQuestion.question}</p>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center text-gray-400 py-6">
                            <p className="text-4xl mb-2">👋</p>
                            <p>Hi! I'm MathMagic!</p>
                            <p>I'm here to help you 😊</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                                <span>{msg.role === 'Hint' ? '💡' : msg.role === 'Solution' ? '✅' : '⚠️'}</span>
                                <span className="text-purple-300 font-bold text-sm">{msg.role}</span>
                            </div>
                            <div className="text-gray-100 prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center gap-2 bg-gray-700 rounded-full px-5 py-3">
                                <span className="animate-bounce">🤔</span>
                                <span className="text-gray-300">MathMagic is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="p-4 border-t border-gray-700 flex gap-3">
                    <button
                        onClick={() => askBot('hint')}
                        disabled={isLoading}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <span>💡</span>
                        <span>Give me a hint</span>
                    </button>
                    <button
                        onClick={() => askBot('solution')}
                        disabled={isLoading || !hintGiven}
                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        title={!hintGiven ? 'Try a hint first!' : ''}
                    >
                        <span>✅</span>
                        <span>Show solution</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

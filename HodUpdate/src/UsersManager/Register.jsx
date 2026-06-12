import { useState } from 'react';
import { register } from '../services/AuthService';

export default function Register({ onNavigate }) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !firstName || !lastName || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await register({ email, password, firstName, lastName });
            alert('Account created! Please log in.');
            onNavigate && onNavigate('login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleRegister();
    };

    const inputClass = "w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors";

    return (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[80vh]">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">📝</div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Set up a parent account to get started</p>
                </div>

                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">First Name</label>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} onKeyDown={handleKeyDown} placeholder="John" className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name</label>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} onKeyDown={handleKeyDown} placeholder="Doe" className={inputClass} />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="parent@example.com" className={inputClass} />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="Create a password" className={inputClass} />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="Confirm your password" className={inputClass} />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <button
                                onClick={() => onNavigate && onNavigate('login')}
                                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                            >
                                Log in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

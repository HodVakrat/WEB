import { useState } from 'react';
import LabeledInput from '../UIComponents/LabeledInput';
import ActionButton from '../UIComponents/ActionButton';
import { login } from '../services/AuthService';

export default function Login({ onNavigate, onLogin }) {
    /*
     * Controlled fields + UI state (error message, request-in-flight).
     */
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /*
     * Validate presence, call the login service, and on success hand the
     * parent up to ComponentSwitcher (onLogin), which stores it + navigates.
     */
    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const parent = await login(email, password);
            onLogin && onLogin(parent);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded shadow-md w-96 justify-self-center justify-items-center mx-auto my-16 text-white border border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-center">Log in</h2>

            <LabeledInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <LabeledInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

            {/* Error message (only when there is one) */}
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <ActionButton text={loading ? 'Logging in...' : 'Login'} backgroundColor="CornflowerBlue" onClick={handleLogin} disabled={loading} />
            <ActionButton text="Register" backgroundColor="Gray" onClick={() => onNavigate && onNavigate('register')} disabled={loading} />
        </div>
    );
}

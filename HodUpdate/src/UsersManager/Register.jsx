import { useState } from 'react';
import LabeledInput from '../UIComponents/LabeledInput';
import ActionButton from '../UIComponents/ActionButton';
import { register } from '../services/AuthService';

export default function Register({ onNavigate }) {
    /*
     * Controlled form fields for the parent account, plus UI state:
     * error  - a message to show the user, loading - request in flight.
     */
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /*
     * Client-side checks (fast feedback only) then call the register service.
     * The server validates again — this is convenience, not the real guard.
     */
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

    return (
        <div className="bg-gray-800 p-8 rounded shadow-md w-96 justify-self-center justify-items-center mx-auto my-16 text-white border border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-center">Create a parent account</h2>

            <LabeledInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <LabeledInput label="First Name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <LabeledInput label="Last Name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
            <LabeledInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <LabeledInput label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

            {/* Error message (only when there is one) */}
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <ActionButton text={loading ? 'Creating...' : 'Register'} backgroundColor="CornflowerBlue" onClick={handleRegister} disabled={loading} />
            <ActionButton text="Back to Login" backgroundColor="Gray" onClick={() => onNavigate && onNavigate('login')} disabled={loading} />
        </div>
    );
}

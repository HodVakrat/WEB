import { useState } from 'react';
import { addProfile, editProfile, deleteProfile } from '../services/ProfileService';

const AVATAR_OPTIONS = ['🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🐯', '🐸', '🐵', '🐰', '🐹', '🐲', '🐙', '🦉', '🦋', '🐝', '🐢', '🐬', '🦖', '🐳', '🐧', '🦕'];

export default function ParentScreen({ parent, onEnterProfile, onLogout, onParentUpdated, onNavigate }) {
    const profiles = parent?.profiles ?? [];

    const [showGuide, setShowGuide] = useState(() => {
        return !localStorage.getItem('guideCompleted');
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formName, setFormName] = useState('');
    const [formBirthday, setFormBirthday] = useState('');
    const [formAvatar, setFormAvatar] = useState(AVATAR_OPTIONS[0]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

    const openAdd = () => {
        setEditingId(null);
        setFormName('');
        setFormBirthday('');
        setFormAvatar(AVATAR_OPTIONS[0]);
        setError('');
        setShowForm(true);
    };

    const openEdit = (profile) => {
        setEditingId(profile._id);
        setFormName(profile.name);
        setFormBirthday(profile.birthday ? profile.birthday.slice(0, 10) : '');
        setFormAvatar(AVATAR_OPTIONS.includes(profile.avatar) ? profile.avatar : AVATAR_OPTIONS[0]);
        setError('');
        setShowForm(true);
    };

    const submitForm = async () => {
        if (!formName.trim()) {
            setError('Please enter a name.');
            return;
        }
        if (!formBirthday) {
            setError('Please enter a birthday.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const updated = editingId
                ? await editProfile(editingId, { name: formName, avatar: formAvatar, birthday: formBirthday })
                : await addProfile(parent._id, { name: formName, avatar: formAvatar, birthday: formBirthday });
            onParentUpdated(updated);
            setShowForm(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (profile) => {
        if (!confirm(`Delete ${profile.name}? This removes all their progress.`)) return;
        try {
            const updated = await deleteProfile(profile._id);
            onParentUpdated(updated);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="p-6 min-h-[80vh]">
            {/* Welcome */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Hi, {parent?.firstName}! 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Who is learning today?</p>
                {!showGuide && (
                    <button
                        onClick={() => setShowGuide(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                        📖 Show Guide
                    </button>
                )}
            </div>

            {/* Getting Started Guide */}
            {showGuide && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <span>📖</span> Getting Started
                        </h2>
                        <button
                            onClick={() => {
                                setShowGuide(false);
                                localStorage.setItem('guideCompleted', 'true');
                            }}
                            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 text-sm font-semibold transition-colors"
                        >
                            Dismiss ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-blue-100 dark:border-gray-700 text-center">
                            <div className="text-5xl mb-3">👶</div>
                            <div className="bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full inline-block mb-2">Step 1</div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Create a Profile</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Click <span className="font-semibold text-green-600">+ Add Profile</span> below. Enter your kid's name, birthday, and pick a fun avatar!
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-blue-100 dark:border-gray-700 text-center">
                            <div className="text-5xl mb-3">🧮</div>
                            <div className="bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full inline-block mb-2">Step 2</div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Start a Quiz</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Click <span className="font-semibold text-blue-600">Let's Go!</span> on a profile, pick a subject, and start solving! Questions adapt to your kid's level.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-blue-100 dark:border-gray-700 text-center">
                            <div className="text-5xl mb-3">⭐</div>
                            <div className="bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full inline-block mb-2">Step 3</div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Earn & Spend Coins</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Correct answers earn coins! Spend them in the <span className="font-semibold text-purple-600">Shop</span> to unlock special avatars. Track progress in <span className="font-semibold text-indigo-600">History</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Profiles grid */}
            {profiles.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">👶</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No profiles yet</p>
                    <p className="text-gray-400 dark:text-gray-500">Create your first kid's profile to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
                    {profiles.map((p) => (
                        <div key={p._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500/50 transition-all group">
                            <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">{p.avatar}</div>
                            <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">{p.name}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Age: {p.birthday ? getAge(p.birthday) : '?'}</p>
                            <p className="text-yellow-500 dark:text-yellow-400 text-sm mb-4 font-semibold">⭐ {p.coins} coins</p>
                            <button
                                onClick={() => onEnterProfile(p)}
                                className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl font-bold text-white transition-colors mb-3"
                            >
                                Let's Go!
                            </button>
                            <button
                                onClick={() => onNavigate && onNavigate('history', { profileId: p._id, profileName: p.name })}
                                className="w-full bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/40 text-indigo-600 dark:text-indigo-400 py-1.5 rounded-lg text-sm font-semibold transition-colors mb-2"
                            >
                                📚 View History
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(p)} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 transition-colors">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(p)} className="flex-1 bg-red-50 dark:bg-red-600/20 hover:bg-red-100 dark:hover:bg-red-600/40 text-red-500 dark:text-red-400 py-1.5 rounded-lg text-sm transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add profile button */}
            <div className="flex justify-center mb-8">
                <button
                    onClick={openAdd}
                    className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-bold text-white transition-colors flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    <span>Add Profile</span>
                </button>
            </div>

            {/* Add/Edit form modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                            {editingId ? 'Edit Profile' : 'New Profile'}
                        </h3>

                        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Name</label>
                        <input
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            maxLength={20}
                            placeholder="Enter kid's name"
                            className="w-full p-3 mb-5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        />

                        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Birthday</label>
                        <input
                            type="date"
                            value={formBirthday}
                            onChange={(e) => setFormBirthday(e.target.value)}
                            className="w-full p-3 mb-5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        />

                        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Choose an avatar</label>
                        <div className="grid grid-cols-8 gap-2 mb-6">
                            {AVATAR_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => setFormAvatar(emoji)}
                                    className={`text-2xl p-1.5 rounded-lg transition-all ${formAvatar === emoji ? 'bg-blue-600 scale-110' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 mb-4">
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={submitForm}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl font-bold text-white disabled:opacity-60 transition-colors"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                disabled={loading}
                                className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

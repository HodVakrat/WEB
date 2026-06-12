import { useState } from 'react';
import { addProfile, editProfile, deleteProfile } from '../services/ProfileService';

const AVATAR_OPTIONS = ['🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐰', '🐹', '🦄', '🐲', '🐙', '🦉', '🦋', '🐝', '🐢', '🐬', '🦖', '🐳', '🐧', '🦕'];

export default function ParentScreen({ parent, onEnterProfile, onLogout, onParentUpdated }) {
    const profiles = parent?.profiles ?? [];

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formName, setFormName] = useState('');
    const [formAvatar, setFormAvatar] = useState(AVATAR_OPTIONS[0]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const openAdd = () => {
        setEditingId(null);
        setFormName('');
        setFormAvatar(AVATAR_OPTIONS[0]);
        setError('');
        setShowForm(true);
    };

    const openEdit = (profile) => {
        setEditingId(profile._id);
        setFormName(profile.name);
        setFormAvatar(AVATAR_OPTIONS.includes(profile.avatar) ? profile.avatar : AVATAR_OPTIONS[0]);
        setError('');
        setShowForm(true);
    };

    const submitForm = async () => {
        if (!formName.trim()) {
            setError('Please enter a name.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const updated = editingId
                ? await editProfile(editingId, { name: formName, avatar: formAvatar })
                : await addProfile(parent._id, { name: formName, avatar: formAvatar });
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
                <h1 className="text-3xl font-bold text-white mb-2">
                    Hi, {parent?.firstName}! 👋
                </h1>
                <p className="text-gray-400 text-lg">Who is learning today?</p>
            </div>

            {/* Profiles grid */}
            {profiles.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">👶</div>
                    <p className="text-gray-400 text-lg mb-2">No profiles yet</p>
                    <p className="text-gray-500">Create your first kid's profile to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
                    {profiles.map((p) => (
                        <div key={p._id} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all group">
                            <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">{p.avatar}</div>
                            <p className="font-bold text-lg text-white mb-1">{p.name}</p>
                            <p className="text-yellow-400 text-sm mb-4 font-semibold">⭐ {p.coins} coins</p>
                            <button
                                onClick={() => onEnterProfile(p)}
                                className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl font-bold text-white transition-colors mb-3"
                            >
                                Let's Go!
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(p)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-1.5 rounded-lg text-sm text-gray-300 transition-colors">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(p)} className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 py-1.5 rounded-lg text-sm transition-colors">
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
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-6 text-white">
                            {editingId ? 'Edit Profile' : 'New Profile'}
                        </h3>

                        <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
                        <input
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            maxLength={20}
                            placeholder="Enter kid's name"
                            className="w-full p-3 mb-5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        />

                        <label className="block text-sm font-semibold text-gray-300 mb-3">Choose an avatar</label>
                        <div className="grid grid-cols-8 gap-2 mb-6">
                            {AVATAR_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => setFormAvatar(emoji)}
                                    className={`text-2xl p-1.5 rounded-lg transition-all ${formAvatar === emoji ? 'bg-blue-600 scale-110' : 'bg-gray-700 hover:bg-gray-600'}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                                <p className="text-red-400 text-sm">{error}</p>
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
                                className="flex-1 bg-gray-600 hover:bg-gray-500 px-4 py-3 rounded-xl font-bold text-white transition-colors"
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

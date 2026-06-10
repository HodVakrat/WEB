import { useState } from 'react';
import { addProfile, editProfile, deleteProfile } from '../services/ProfileService';

/*
 * Kid-friendly avatar choices. Lives only on the front: the picker below
 * forces the user to choose exactly one of these, so the server never has
 * to validate the avatar value.
 */
const AVATAR_OPTIONS = ['🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐰', '🐹', '🦄', '🐲', '🐙', '🦉', '🦋', '🐝', '🐢', '🐬', '🦖', '🐳', '🐧', '🦕'];

export default function ParentScreen({ parent, onEnterProfile, onLogout, onParentUpdated }) {
    const profiles = parent?.profiles ?? [];

    /*
     * Form state for adding/editing a profile.
     * editingId: null = adding a new profile, otherwise = the profile being edited.
     */
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

    /*
     * Save (add or edit). On success, hand the updated parent up so the
     * whole app refreshes, then close the form.
     */
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
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Header: greeting + logout */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Hi, {parent?.firstName}! 👋</h1>
                <button onClick={onLogout} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-bold">
                    Logout
                </button>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-gray-300">Who is learning today?</h2>

            {/* Profiles grid, or an empty state */}
            {profiles.length === 0 ? (
                <p className="text-gray-400 mb-8">No profiles yet — create your first one below.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {profiles.map((p) => (
                        <div key={p._id} className="bg-gray-800 border border-gray-700 rounded-lg p-5 text-center">
                            <div className="text-5xl mb-2">{p.avatar}</div>
                            <p className="font-bold text-lg">{p.name}</p>
                            <p className="text-yellow-400 text-sm mb-3">⭐ {p.coins} coins</p>
                            <button onClick={() => onEnterProfile(p)} className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded mb-2 font-bold">
                                Enter
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(p)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-1 rounded text-sm">Edit</button>
                                <button onClick={() => handleDelete(p)} className="flex-1 bg-red-700 hover:bg-red-600 py-1 rounded text-sm">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions: add profile + general stats (stats wired in a later step) */}
            <div className="flex gap-4 mb-8">
                <button onClick={openAdd} className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-lg font-bold">
                    + Add profile
                </button>
                <button onClick={() => alert('In the future.')} className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-lg font-bold">
                    View statistics
                </button>
            </div>

            {/* Add/Edit form */}
            {showForm && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md">
                    <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit profile' : 'New profile'}</h3>

                    <label className="block text-sm mb-1">Name</label>
                    <input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        maxLength={20}
                        className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
                    />

                    <label className="block text-sm mb-2">Choose an avatar</label>
                    <div className="grid grid-cols-8 gap-2 mb-4">
                        {AVATAR_OPTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => setFormAvatar(emoji)}
                                className={`text-2xl p-1 rounded ${formAvatar === emoji ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                    <div className="flex gap-2">
                        <button onClick={submitForm} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-60">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setShowForm(false)} disabled={loading} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

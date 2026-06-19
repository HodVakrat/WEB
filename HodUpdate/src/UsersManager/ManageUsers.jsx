import { useState } from 'react';
import ActionButton from '../UIComponents/ActionButton';

const initialUsers = [
    { id: 1, username: 'jsmith', name: 'John Smith', email: 'jsmith@example.com', role: 'User' },
    { id: 2, username: 'ajones', name: 'Alice Jones', email: 'ajones@example.com', role: 'Admin' },
    { id: 3, username: 'bwilson', name: 'Bob Wilson', email: 'bwilson@example.com', role: 'User' },
];

export default function ManageUsers() {
    const [users, setUsers] = useState(initialUsers);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleEdit = (user) => {
        setEditingId(user.id);
        setEditForm({ ...user });
    };

    const handleSave = () => {
        setUsers(users.map(u => u.id === editingId ? { ...editForm } : u));
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md mx-auto my-16 w-fit text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-center">Manage Users</h2>
            <table className="table-auto border-collapse w-full text-sm">
                <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Username</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Name</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Email</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Role</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600">
                            {editingId === user.id ? (
                                <>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{user.username}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                        <input className="border border-gray-300 dark:border-gray-600 rounded p-1 w-32 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" value={editForm.name}
                                            onChange={e => handleChange('name', e.target.value)} />
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                        <input className="border border-gray-300 dark:border-gray-600 rounded p-1 w-44 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" value={editForm.email}
                                            onChange={e => handleChange('email', e.target.value)} />
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                        <select className="border border-gray-300 dark:border-gray-600 rounded p-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" value={editForm.role}
                                            onChange={e => handleChange('role', e.target.value)}>
                                            <option>User</option>
                                            <option>Admin</option>
                                        </select>
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 flex gap-1">
                                        <ActionButton text="Save" backgroundColor="#2563eb" onClick={handleSave} />
                                        <ActionButton text="Cancel" backgroundColor="#4b5563" onClick={() => setEditingId(null)} />
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{user.username}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{user.name}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{user.email}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{user.role}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 flex gap-1">
                                        <ActionButton text="Edit" backgroundColor="#2563eb" onClick={() => handleEdit(user)} />
                                        <ActionButton text="Delete" backgroundColor="#dc2626" onClick={() => handleDelete(user.id)} />
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

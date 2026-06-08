import { useState } from 'react';
import LabeledInput from '../UIComponents/LabeledInput';
import ActionButton from '../UIComponents/ActionButton';

const initialUser = { id: 1, username: 'jsmith', name: 'John Smith', email: 'jsmith@example.com', role: 'User' };

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(initialUser);

    const handleClick = (buttonText) => {
        if (buttonText === "Edit") {
            setIsEditing(true);
        } else if (buttonText === "Save") {
            alert("Profile saved!");
            setIsEditing(false);
        } else if (buttonText === "Cancel") {
            setIsEditing(false);
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded shadow-md w-96 justify-self-center justify-items-center mx-auto my-16 text-white border border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-center">User Profile</h2>
            <form id="profileForm">
                <LabeledInput label="Username" type="text" disabled={true} value={user.username} />
                <LabeledInput label="Name" type="text" disabled={!isEditing} value={user.name}
                    onChange={e => setUser(prev => ({ ...prev, name: e.target.value }))} />
                <LabeledInput label="Email" type="email" disabled={!isEditing} value={user.email}
                    onChange={e => setUser(prev => ({ ...prev, email: e.target.value }))} />
                {isEditing && (
                    <>
                        <LabeledInput label="New Password" type="password" />
                        <LabeledInput label="Confirm Password" type="password" />
                    </>
                )}
                {!isEditing ? (
                    <ActionButton text="Edit" backgroundColor="CornflowerBlue" onClick={() => handleClick("Edit")} />
                ) : (
                    <>
                        <ActionButton text="Save" backgroundColor="CornflowerBlue" onClick={() => handleClick("Save")} />
                        <ActionButton text="Cancel" backgroundColor="Gray" onClick={() => handleClick("Cancel")} />
                    </>
                )}
            </form>
        </div>
    );
}

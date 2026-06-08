import { useState, useEffect } from 'react';
import Login from '../UsersManager/Login.jsx';
import Register from '../UsersManager/Register.jsx';
import ManageUsers from '../UsersManager/ManageUsers.jsx';
import Profile from '../UsersManager/profile.jsx';
import MathDashboard from '../UsersManager/MathDashboard.jsx';
import QuizPage from '../UsersManager/QuizPage.jsx';
import HistoryPage from '../UsersManager/HistoryPage.jsx';
import ParentScreen from '../UsersManager/ParentScreen.jsx';
import { getParent } from '../services/AuthService.js';
import AvatarShop from '../UIComponents/AvatarShop.jsx';

function ComponentSwitcher() {
    const [activeComponent, setActiveComponent] = useState('login');
    const [quizSettings, setQuizSettings] = useState({ subject: 'Addition', level: 'Beginner' });

    // Session state.
    const [currentParent, setCurrentParent] = useState(null); // logged-in parent (no password)
    const [activeProfile, setActiveProfile] = useState(null); // the kid currently using the app
    const [restoring, setRestoring] = useState(true);         // checking localStorage on first load

    /*
     * Restore the session on load. We only store IDs in localStorage and
     * fetch a FRESH parent from the DB (the DB is the source of truth).
     * If the saved parent/profile no longer exists, clear and start over.
     */
    useEffect(() => {
        const savedParentId = localStorage.getItem('parentId');
        if (!savedParentId) {
            setRestoring(false);
            return;
        }
        getParent(savedParentId)
            .then((parent) => {
                setCurrentParent(parent);
                const savedProfileId = localStorage.getItem('activeProfileId');
                const profile = savedProfileId
                    ? parent.profiles.find((p) => p._id === savedProfileId)
                    : null;
                if (profile) {
                    setActiveProfile(profile);
                    setActiveComponent('dashboard');
                } else {
                    localStorage.removeItem('activeProfileId');
                    setActiveComponent('parent');
                }
            })
            .catch(() => {
                localStorage.removeItem('parentId');
                localStorage.removeItem('activeProfileId');
            })
            .finally(() => setRestoring(false));
    }, []);

    const handleNavigate = (componentName, settings = null) => {
        if (settings) setQuizSettings(settings);
        setActiveComponent(componentName);
    };

    // Login success: store the parent + remember its id, go to the parent screen.
    const handleLogin = (parent) => {
        setCurrentParent(parent);
        localStorage.setItem('parentId', parent._id);
        setActiveComponent('parent');
    };

    // Parent picked a kid: become that profile and go to the dashboard.
    const handleEnterProfile = (profile) => {
        setActiveProfile(profile);
        localStorage.setItem('activeProfileId', profile._id);
        setActiveComponent('dashboard');
    };

    // Leave the kid's session, back to the parent screen.
    const handleBackToParent = () => {
        setActiveProfile(null);
        localStorage.removeItem('activeProfileId');
        setActiveComponent('parent');
    };

    // Full logout: clear everything.
    const handleLogout = () => {
        setCurrentParent(null);
        setActiveProfile(null);
        localStorage.removeItem('parentId');
        localStorage.removeItem('activeProfileId');
        setActiveComponent('login');
    };

    // After add/edit/delete profile: refresh the parent (and active profile if any).
    const handleParentUpdated = (parent) => {
        setCurrentParent(parent);
        if (activeProfile) {
            setActiveProfile(parent.profiles.find((p) => p._id === activeProfile._id) || null);
        }
    };

    /*
     * After a quiz the server returns the new wallet balance. Update both the
     * active profile (dashboard) and the matching profile inside currentParent
     * (so the parent screen's card is correct too).
     */
    const handleCoinsUpdated = (newCoins) => {
        setActiveProfile((prev) => (prev ? { ...prev, coins: newCoins } : prev));
        setCurrentParent((prev) => {
            if (!prev || !activeProfile) return prev;
            return {
                ...prev,
                profiles: prev.profiles.map((p) =>
                    p._id === activeProfile._id ? { ...p, coins: newCoins } : p,
                ),
            };
        });
    };

    // While checking for a saved session, avoid flashing the login screen.
    if (restoring) {
        return <p className="text-gray-400 italic p-6">Loading…</p>;
    }

    const components_map = {
        'login': <Login onNavigate={handleNavigate} onLogin={handleLogin} />,
        'register': <Register onNavigate={handleNavigate} />,
        'parent': <ParentScreen parent={currentParent} onEnterProfile={handleEnterProfile} onLogout={handleLogout} onParentUpdated={handleParentUpdated} />,
        'dashboard': <MathDashboard profile={activeProfile} onNavigate={handleNavigate} onBackToParent={handleBackToParent} />,
        'quiz': <QuizPage subject={quizSettings.subject} level={quizSettings.level} profileId={activeProfile?._id} onNavigate={handleNavigate} onCoinsUpdated={handleCoinsUpdated} />,
        'history': <HistoryPage onNavigate={handleNavigate} />,
        'manage': <ManageUsers />,
        'profile': <Profile />,
        'shop': activeProfile ? (
        <AvatarShop currentProfile={activeProfile} onParentUpdated={handleParentUpdated} />
    ) : (
        <p className="text-gray-400 italic">please enter to your profile first</p>
    ),
    };

    const componentToShow = components_map[activeComponent] ||
        <p className="text-gray-400 italic">No component selected.</p>;
    const buttonStyles = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
    const navLabels = {
        'login': 'Login',
        'register': 'Register',
        'parent': 'Parent',
        'dashboard': 'Dashboard',
        'quiz': 'Quiz',
        'history': 'History',
        'manage': 'Manage Users',
        'profile': 'Profile',
        'shop': 'Avatar Shop',
    };
    return (
        <div className="flex flex-col items-center p-6 font-bold rounded-md shadow-md">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                {Object.keys(components_map).map(key => (
                    <button
                        key={key}
                        className={`${buttonStyles} ${activeComponent === key ? 'bg-blue-800' : ''}`}
                        onClick={() => handleNavigate(key)}>
                        {navLabels[key]}
                    </button>))}
            </div>
            <div className="bg-gray-800 p-6 rounded-md w-full max-w-4xl text-center text-white border border-gray-700">{componentToShow}</div>
        </div>
    );
}
export default ComponentSwitcher;

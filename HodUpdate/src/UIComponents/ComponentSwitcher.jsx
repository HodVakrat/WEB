import { useState, useEffect } from 'react';
import Login from '../UsersManager/Login.jsx';
import Register from '../UsersManager/Register.jsx';
import ParentScreen from '../UsersManager/ParentScreen.jsx';
import MathDashboard from '../UsersManager/MathDashboard.jsx';
import QuizPage from '../UsersManager/QuizPage.jsx';
import HistoryPage from '../UsersManager/HistoryPage.jsx';
import AvatarShop from '../UIComponents/AvatarShop.jsx';
import { getParent } from '../services/AuthService.js';

function ComponentSwitcher() {
    const [activeComponent, setActiveComponent] = useState('login');
    const [quizSettings, setQuizSettings] = useState({ subject: 'Addition', level: 'Beginner' });

    const [currentParent, setCurrentParent] = useState(null);
    const [activeProfile, setActiveProfile] = useState(null);
    const [restoring, setRestoring] = useState(true);

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

    const handleLogin = (parent) => {
        setCurrentParent(parent);
        localStorage.setItem('parentId', parent._id);
        setActiveComponent('parent');
    };

    const handleEnterProfile = (profile) => {
        setActiveProfile(profile);
        localStorage.setItem('activeProfileId', profile._id);
        setActiveComponent('dashboard');
    };

    const handleBackToParent = () => {
        setActiveProfile(null);
        localStorage.removeItem('activeProfileId');
        setActiveComponent('parent');
    };

    const handleLogout = () => {
        setCurrentParent(null);
        setActiveProfile(null);
        localStorage.removeItem('parentId');
        localStorage.removeItem('activeProfileId');
        setActiveComponent('login');
    };

    const handleParentUpdated = (parent) => {
        setCurrentParent(parent);
        if (activeProfile) {
            setActiveProfile(parent.profiles.find((p) => p._id === activeProfile._id) || null);
        }
    };

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

    if (restoring) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🧮</div>
                    <p className="text-gray-400 text-lg">Loading MathematiKids...</p>
                </div>
            </div>
        );
    }

    const isLoggedIn = !!currentParent;
    const isInProfile = !!activeProfile;

    const renderContent = () => {
        switch (activeComponent) {
            case 'login':
                return <Login onNavigate={handleNavigate} onLogin={handleLogin} />;
            case 'register':
                return <Register onNavigate={handleNavigate} />;
            case 'parent':
                return <ParentScreen parent={currentParent} onEnterProfile={handleEnterProfile} onLogout={handleLogout} onParentUpdated={handleParentUpdated} />;
            case 'dashboard':
                return <MathDashboard profile={activeProfile} onNavigate={handleNavigate} onBackToParent={handleBackToParent} />;
            case 'quiz':
                return <QuizPage subject={quizSettings.subject} level={quizSettings.level} profileId={activeProfile?._id} onNavigate={handleNavigate} onCoinsUpdated={handleCoinsUpdated} />;
            case 'history':
                return <HistoryPage onNavigate={handleNavigate} />;
            case 'shop':
                return activeProfile
                    ? <AvatarShop currentProfile={activeProfile} onParentUpdated={handleParentUpdated} onNavigate={handleNavigate} />
                    : <p className="text-gray-400 italic p-6">Please enter a profile first.</p>;
            default:
                return <Login onNavigate={handleNavigate} onLogin={handleLogin} />;
        }
    };

    return (
        <>
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => handleNavigate(isInProfile ? 'dashboard' : isLoggedIn ? 'parent' : 'login')}
                    >
                        <span className="text-3xl">🧮</span>
                        <h1 className="text-xl font-bold text-white">
                            Mathemati<span className="text-blue-400">Kids</span>
                        </h1>
                    </div>

                    {isLoggedIn && (
                        <nav className="flex items-center gap-2">
                            {isInProfile && (
                                <>
                                    <button
                                        onClick={() => handleNavigate('dashboard')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeComponent === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => handleNavigate('history')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeComponent === 'history' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                                    >
                                        History
                                    </button>
                                    <button
                                        onClick={() => handleNavigate('shop')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeComponent === 'shop' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                                    >
                                        Shop
                                    </button>
                                    <div className="w-px h-6 bg-gray-600 mx-1"></div>
                                    <div className="flex items-center gap-1.5 text-sm text-yellow-400 font-bold bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                        <span>⭐</span>
                                        <span>{activeProfile.coins}</span>
                                    </div>
                                    <button
                                        onClick={handleBackToParent}
                                        className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-700 transition-colors"
                                    >
                                        Switch Kid
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                Logout
                            </button>
                        </nav>
                    )}
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
                <div className="max-w-6xl mx-auto">
                    {renderContent()}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 border-t border-gray-700 py-4 text-center text-gray-500 text-sm">
                <p>&copy; 2026 MathematiKids &mdash; Making math fun for kids!</p>
            </footer>
        </>
    );
}

export default ComponentSwitcher;

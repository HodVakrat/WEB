import { useState } from 'react';
import Login from '../UsersManager/Login.jsx';
import Register from '../UsersManager/Register.jsx';
import ManageUsers from '../UsersManager/ManageUsers.jsx';
import Profile from '../UsersManager/profile.jsx';
import MathDashboard from '../UsersManager/MathDashboard.jsx';
import QuizPage from '../UsersManager/QuizPage.jsx';
import HistoryPage from '../UsersManager/HistoryPage.jsx';

function ComponentSwitcher() {
    const [activeComponent, setActiveComponent] = useState('login');
    const [quizSettings, setQuizSettings] = useState({ subject: 'Addition', level: 'Beginner' });
    
    const handleNavigate = (componentName, settings = null) => {
        if (settings) {
            setQuizSettings(settings);
        }
        setActiveComponent(componentName);
    };

    const components_map = {
        'login': <Login onNavigate={handleNavigate} />,
        'register': <Register onNavigate={handleNavigate} />,
        'dashboard': <MathDashboard onNavigate={handleNavigate} />,
        'quiz': <QuizPage subject={quizSettings.subject} level={quizSettings.level} onNavigate={handleNavigate} />,
        'history': <HistoryPage onNavigate={handleNavigate} />,
        'manage': <ManageUsers />,
        'profile': <Profile />,
    };
    
    const componentToShow = components_map[activeComponent] ||
        <p className="text-gray-400 italic">No component selected.</p>;
    const buttonStyles = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
    const navLabels = {
        'login': 'Login',
        'register': 'Register',
        'dashboard': 'Dashboard',
        'quiz': 'Quiz',
        'history': 'History',
        'manage': 'Manage Users',
        'profile': 'Profile',
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
import { useState } from 'react';
import { buyAvatar } from '../services/ProfileService';

const AVAILABLE_AVATARS = [
  { id: 'lion', label: 'Brave Lion', icon: '🦁', cost: 10 },
  { id: 'wizard', label: 'Number Wizard', icon: '🧙‍♂️', cost: 25 },
  { id: 'unicorn', label: 'Magic Unicorn', icon: '🦄', cost: 50 },
  { id: 'dragon', label: 'Algebra Dragon', icon: '🐉', cost: 100 },
];

export default function AvatarShop({ currentProfile, onParentUpdated, onNavigate }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuy = async (item) => {
    setError('');
    setSuccess('');

    if (currentProfile.coins < item.cost) {
      setError('Not enough coins! Keep solving quizzes to earn more.');
      return;
    }

    setLoading(true);
    try {
      const updatedParent = await buyAvatar(currentProfile._id, { avatar: item.icon, cost: item.cost });
      setSuccess(`Congrats! You chose ${item.label}! 🎉`);
      onParentUpdated(updatedParent);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5"
          >
            ← Back to Dashboard
          </button>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Avatar Shop ✨</h2>
        <p className="text-center mb-8 text-gray-500 dark:text-gray-400">
          Spend your coins on awesome avatars!
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Your balance</p>
          <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">⭐ {currentProfile.coins} coins</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 mb-4 text-center">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-3 mb-4 text-center">
            <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {AVAILABLE_AVATARS.map((item) => {
            const isCurrent = currentProfile.avatar === item.icon;
            const canAfford = currentProfile.coins >= item.cost;
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 border-2 p-5 rounded-2xl text-center flex flex-col justify-between transition-all ${
                  isCurrent ? 'border-green-500 bg-green-50 dark:bg-green-500/5' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div>
                  <div className="text-5xl mb-3">{item.icon}</div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">{item.label}</p>
                  <p className="text-sm text-yellow-500 dark:text-yellow-400 mb-4 font-semibold">⭐ {item.cost} coins</p>
                </div>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={loading || isCurrent}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    isCurrent
                      ? 'bg-green-600 text-white cursor-default'
                      : canAfford
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCurrent ? '✓ Current' : canAfford ? 'Buy' : 'Not enough coins'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

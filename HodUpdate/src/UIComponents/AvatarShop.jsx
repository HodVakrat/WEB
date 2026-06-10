import React, { useState } from 'react';
import { buyAvatar } from '../services/ProfileService'; 

const AVAILABLE_AVATARS = [
  { id: 'lion', label: 'brave lion', icon: '🦁', cost: 10 },
  { id: 'wizard', label: 'numbers magicion', icon: '🧙‍♂️', cost: 25 },
  { id: 'unicorn', label: 'magical unicorn', icon: '🦄', cost: 50 },
  { id: 'dragon', label: 'algebra dragon', icon: '🐉', cost: 100 },
];

export default function AvatarShop({ currentProfile, onParentUpdated }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuy = async (item) => {
    setError('');
    setSuccess('');

    if (currentProfile.coins < item.cost) {
      setError('not enough coins, keep solving quizes');
      return;
    }

    setLoading(true);
    try {
      const updatedParent = await buyAvatar(currentProfile._id, { avatar: item.icon, cost: item.cost });
      
      setSuccess(`congrats you chose ${item.label}! 🎉`);
      
      onParentUpdated(updatedParent); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl mx-auto my-8 text-white direction-rtl">
      <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">Avatar Shop✨</h2>
      
      <p className="text-center mb-6 text-gray-300 font-semibold">
        🪙 your coins: <span className="text-yellow-400 font-bold text-xl">{currentProfile.coins}</span>
      </p>

      {error && <p className="text-red-400 text-sm mb-4 text-center bg-red-900/30 p-2 rounded">{error}</p>}
      {success && <p className="text-green-400 text-sm mb-4 text-center bg-green-900/30 p-2 rounded">{success}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {AVAILABLE_AVATARS.map((item) => {
          const isCurrent = currentProfile.avatar === item.icon;
          return (
            <div key={item.id} className={`bg-gray-700 border p-4 rounded-lg text-center flex flex-col justify-between ${isCurrent ? 'border-green-500' : 'border-gray-600'}`}>
              <div className="text-4xl mb-2">{item.icon}</div>
              <p className="font-bold mb-1">{item.label}</p>
              <p className="text-sm text-pink-400 mb-3 font-semibold">🪙 {item.cost} מטבעות</p>
              
              <button
                onClick={() => handleBuy(item)}
                disabled={loading || isCurrent}
                className={`w-full py-2 rounded font-bold text-sm ${isCurrent ? 'bg-green-600 cursor-default' : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-50'}`}
              >
                {isCurrent ? 'your avatar' : 'buy avatar'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
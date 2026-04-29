import React from "react";
import Image from "next/image";

const members = [
  { id: 1, name: "Phoenix Baker", date: "Feb 2026", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60", active: true },
  { id: 2, name: "Lana Steiner", date: "Jan 2026", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60", active: true },
  { id: 3, name: "Demi Wilkinson", date: "Mar 2026", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60", active: true },
  { id: 4, name: "Candice Wu", date: "Feb 2026", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60", active: false },
  { id: 5, name: "Natali Craig", date: "Mar 2026", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=60", active: false },
  { id: 6, name: "Orlando Diggs", date: "Apr 2026", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=60", active: false },
  { id: 7, name: "Drew Cano", date: "Apr 2026", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60", active: true },
];

const TopMembers: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top members</h2>
      
      <div className="flex flex-col space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image 
                  src={member.avatar} 
                  alt={member.name} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">{member.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Member since {member.date}</span>
              </div>
            </div>
            {member.active && (
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopMembers;

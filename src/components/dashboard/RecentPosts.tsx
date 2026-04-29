import React from "react";
import Image from "next/image";
import { MoreVertical } from "lucide-react";

const RecentPosts: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent posts</h2>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Post 1 */}
        <div className="group cursor-pointer">
          <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3">
            <Image 
              src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=500&auto=format&fit=crop&q=60" 
              alt="Recent post 1" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">Olivia Rhye • 20 Jan 2026</h3>
        </div>

        {/* Post 2 */}
        <div className="group cursor-pointer">
          <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3">
            <Image 
              src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&auto=format&fit=crop&q=60" 
              alt="Recent post 2" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">Phoenix Baker • 19 Jan 2026</h3>
        </div>
      </div>
    </div>
  );
};

export default RecentPosts;

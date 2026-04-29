import React from "react";
import { UserPlus, Edit3, MoreVertical } from "lucide-react";

const QuickActions: React.FC = () => {
  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Start creating content</h2>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mr-4 border border-gray-100 dark:border-gray-700 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
            <UserPlus className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Create your first member</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add yourself or import from CSV</p>
          </div>
        </div>

        <div className="flex items-start p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mr-4 border border-gray-100 dark:border-gray-700 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
            <Edit3 className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Create a new post</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dive into the editor and start creating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;

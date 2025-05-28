import React from 'react';

const DialogControls: React.FC = () => {
  return (
    <div className="flex justify-end space-x-2 mb-4">
      {/* New Dialog Button */}
      <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        New Dialog
      </button>

      {/* Saved Dialogs Button */}
      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
        Saved Dialogs
      </button>
    </div>
  );
};

export default DialogControls; 
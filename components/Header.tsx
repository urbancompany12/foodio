import React from 'react';
import { FoodioIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3">
          <FoodioIcon className="w-10 h-10 text-orange-500" />
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Foodio
          </h1>
        </div>
        <p className="text-gray-600 mt-1">AI Food Photo Studio</p>
      </div>
    </header>
  );
};
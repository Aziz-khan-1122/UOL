
import React from 'react';
import type { Page } from '../App';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';

interface HeaderProps {
  currentPage: Page;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, isDarkMode, toggleDarkMode }) => {
  return (
    <header className="bg-white dark:bg-dark-card shadow-sm p-4 flex justify-between items-center transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">{currentPage}</h2>
      <div className="flex items-center">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
};

export default Header;

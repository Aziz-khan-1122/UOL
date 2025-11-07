
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-dark-text">{value}</p>
      </div>
      <div className="bg-primary-100 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 rounded-full p-3">
        <div className="w-6 h-6">
            {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

import React, { useRef } from 'react';
import type { Page } from '../App';
import { DashboardIcon } from './icons/DashboardIcon';
import { BlocksIcon } from './icons/BlocksIcon';
import { UniversityLogoIcon } from './icons/UniversityLogoIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  customLogo: string | null;
  onLogoChange: (logoDataUrl: string | null) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <li
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-primary-500 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-dark-card'
      }`}
      onClick={onClick}
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="ml-4 font-medium">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, customLogo, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveLogo = (e: React.MouseEvent) => {
      e.stopPropagation();
      onLogoChange(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
     // Reset file input value to allow re-uploading the same file
    if(event.target) {
        event.target.value = '';
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-dark-card shadow-lg p-4 flex-shrink-0 hidden md:block transition-colors duration-300">
      <div className="flex flex-col items-center text-center mb-8 px-1">
        <div className="relative group w-24 h-24 mb-4 flex-shrink-0 cursor-pointer" onClick={handleUploadClick}>
            {customLogo ? (
                <img src={customLogo} alt="Custom University Logo" className="w-full h-full object-contain" />
            ) : (
                <UniversityLogoIcon className="w-full h-full object-contain" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button title="Upload Logo" className="text-white p-1 hover:bg-white/20 rounded-full">
                    <UploadIcon />
                </button>
                {customLogo && (
                    <button title="Remove Logo" onClick={handleRemoveLogo} className="text-white p-1 hover:bg-white/20 rounded-full">
                        <TrashIcon />
                    </button>
                )}
            </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />

        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
            University Of Loralai
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Inventory System</p>
        </div>
      </div>
      <nav>
        <ul>
          <NavItem
            icon={<DashboardIcon />}
            label="Dashboard"
            isActive={currentPage === 'Dashboard'}
            onClick={() => onPageChange('Dashboard')}
          />
          <NavItem
            icon={<BlocksIcon />}
            label="Inventory"
            isActive={currentPage === 'Inventory'}
            onClick={() => onPageChange('Inventory')}
          />
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
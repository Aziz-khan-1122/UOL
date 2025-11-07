
import React, { useState, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import useDarkMode from './hooks/useDarkMode';
import { initialBlocks } from './data';
import type { Block, Room, Item } from './types';

export type Page = 'Dashboard' | 'Inventory';

const App: React.FC = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('customLogo');
    }
    return null;
  });

  const handlePageChange = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleLogoChange = useCallback((logoDataUrl: string | null) => {
    if (logoDataUrl) {
      localStorage.setItem('customLogo', logoDataUrl);
      setCustomLogo(logoDataUrl);
    } else {
      localStorage.removeItem('customLogo');
      setCustomLogo(null);
    }
  }, []);

  const dashboardStats = useMemo(() => {
    let totalRooms = 0;
    let totalItems = 0;
    let totalValue = 0;

    blocks.forEach(block => {
      totalRooms += block.rooms.length;
      block.rooms.forEach(room => {
        totalItems += room.items.length;
        room.items.forEach(item => {
          totalValue += item.quantity * item.unitPrice;
        });
      });
    });

    return {
      totalBlocks: blocks.length,
      totalRooms,
      totalItems,
      totalValue,
    };
  }, [blocks]);

  return (
    <div className={`${isDarkMode ? 'dark' : ''} flex h-screen bg-gray-100 dark:bg-dark-bg font-sans`}>
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        customLogo={customLogo}
        onLogoChange={handleLogoChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentPage={currentPage}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-dark-bg p-4 sm:p-6 lg:p-8">
          <div className="transition-opacity duration-300 ease-in-out">
            {currentPage === 'Dashboard' && <DashboardView stats={dashboardStats} blocks={blocks} />}
            {currentPage === 'Inventory' && <InventoryView blocks={blocks} setBlocks={setBlocks} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
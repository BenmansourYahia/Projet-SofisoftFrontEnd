import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && <Sidebar />}
      <div className={sidebarOpen ? "pl-64 flex-1" : "flex-1"}>
        {/* Toggle button */}
        <button
          className={`fixed top-4 z-50 w-10 h-10 flex items-center justify-center transition-all duration-300
            bg-gray-800/90 hover:bg-gray-700 border border-gray-600 shadow-lg hover:shadow-xl
            ${sidebarOpen ? "left-[240px]" : "left-4"}
            rounded-lg backdrop-blur-sm hover:scale-105 active:scale-95`}
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? "Masquer le menu" : "Afficher le menu"}
        >
          <Menu
            className="h-5 w-5 transition-transform duration-300 text-gray-200"
            style={{ transform: sidebarOpen ? "rotate(0deg)" : "rotate(0deg)" }}
          />
        </button>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
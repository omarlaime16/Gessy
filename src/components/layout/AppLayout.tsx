import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-row selection:bg-indigo-500 selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Outlet with Mobile BottomNav Offset */}
        <main className="flex-1 pb-20 md:pb-10">
          <Outlet />
        </main>

        {/* Mobile Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

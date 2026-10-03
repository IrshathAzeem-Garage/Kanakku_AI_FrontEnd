import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex text-gray-900">
      {/* Desktop Left Sidebar (hidden on mobile/tablet) */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Header />
        
        {/* Main responsive container (scales from mobile full-width to desktop max-w-7xl) */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (hidden on lg: screens) */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

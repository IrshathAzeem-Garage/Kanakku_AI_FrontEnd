import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, CloudOff, RefreshCw } from 'lucide-react';
import { useBackendStatus } from '../context/BackendStatusContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { isHealthy, isWakingUp, isOffline } = useBackendStatus();
  const { user, shop } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/scan':
        return 'Scan Kanakku';
      case '/transactions':
        return 'Records & History';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const shopName = shop?.name || 'My Shop';
  const ownerName = user?.fullname || user?.username || 'Owner';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-shop-border">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Mobile Branding (< lg) */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link to="/dashboard" className="block text-left">
            <h1 className="text-base font-bold tracking-tight text-gray-950 flex items-center gap-1.5 leading-none">
              KANAKKU AI
              {isOffline ? (
                <span className="inline-flex items-center text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                  <CloudOff className="w-2.5 h-2.5 mr-0.5" /> Offline
                </span>
              ) : isWakingUp ? (
                <span className="inline-flex items-center text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 animate-pulse">
                  <RefreshCw className="w-2.5 h-2.5 mr-0.5 animate-spin" /> Waking up
                </span>
              ) : null}
            </h1>
            <p className="text-xs text-gray-500 font-medium leading-tight mt-0.5 truncate max-w-[200px]">
              {shopName}
            </p>
          </Link>
        </div>

        {/* Desktop Breadcrumb & Dynamic Store Name (>= lg) */}
        <div className="hidden lg:flex items-center gap-3 text-sm">
          <span className="font-bold text-gray-950">KANAKKU AI</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-semibold">{shopName}</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-md text-xs">
            {getPageTitle()}
          </span>
        </div>

        {/* Right side: Dynamic User info & Settings */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 py-1.5 px-3.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-gray-900">{ownerName}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 capitalize">{user?.role || 'Owner'}</span>
          </div>

          <Link
            to="/settings"
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            title="Settings & Profile"
            aria-label="Settings and Profile"
          >
            <Settings className="w-5 h-5 stroke-[1.75]" />
          </Link>
        </div>
      </div>
    </header>
  );
}

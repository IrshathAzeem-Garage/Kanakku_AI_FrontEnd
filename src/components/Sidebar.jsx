import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  ReceiptText,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBackendStatus } from '../context/BackendStatusContext';

export default function Sidebar() {
  const { user, shop, logout } = useAuth();
  const { isHealthy, isWakingUp, isOffline } = useBackendStatus();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/scan', label: 'Scan Kanakku', icon: Camera, badge: 'AI' },
    { to: '/transactions', label: 'Records', icon: ReceiptText },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const shopName = shop?.name || 'Shop';
  const ownerName = user?.fullname || user?.username || 'Owner';

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-shop-border shrink-0 select-none min-h-screen">
      {/* Brand & Dynamic Business Header */}
      <div className="p-6 border-b border-shop-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-950 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
            {shopName.substring(0, 2).toUpperCase()}
          </div>
          <div className="truncate">
            <h1 className="text-base font-bold text-gray-950 tracking-tight leading-none truncate">
              KANAKKU AI
            </h1>
            <p className="text-xs font-semibold text-gray-500 mt-1 truncate" title={shopName}>
              {shopName}
            </p>
          </div>
        </div>

        {/* Server Status Indicator */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">Server:</span>
          {isOffline ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          ) : isWakingUp ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> Waking up
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
          Accounting Menu
        </span>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gray-950 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Dynamic User Profile & Logout */}
      <div className="p-4 border-t border-shop-border space-y-3">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center justify-between">
          <div className="truncate">
            <span className="text-xs font-bold text-gray-900 block truncate" title={ownerName}>
              {ownerName}
            </span>
            <span className="text-[11px] text-gray-500 font-mono">@{user?.username}</span>
          </div>
          <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
            {user?.role || 'Owner'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

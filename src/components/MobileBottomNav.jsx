import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, ReceiptText, BarChart3 } from 'lucide-react';

export default function MobileBottomNav() {
  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/scan', label: 'Scan', icon: Camera, isPrimary: true },
    { to: '/transactions', label: 'Records', icon: ReceiptText },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-shop-border pb-safe lg:hidden">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors select-none ${
                  isActive
                    ? 'text-gray-950 font-semibold'
                    : 'text-gray-400 hover:text-gray-600 font-normal'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1 rounded-xl transition-all ${
                      item.isPrimary
                        ? isActive
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-900'
                        : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${item.isPrimary ? 'stroke-[2]' : 'stroke-[1.75]'}`} />
                  </div>
                  <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

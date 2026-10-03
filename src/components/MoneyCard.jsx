import React from 'react';
import { formatINR } from '../utils/formatters';

export function MoneyCard({
  title,
  amount,
  subtitle,
  variant = 'default', // 'default', 'customer', 'digital', 'cash', 'expense', 'inhand'
  subDetails = null,
  className = '',
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'inhand':
        return {
          card: 'bg-gray-950 text-white border-gray-900 shadow-md',
          title: 'text-gray-300 font-semibold uppercase tracking-wider text-xs',
          amount: 'text-white text-3xl font-extrabold tracking-tight',
          subtitle: 'text-gray-400 text-xs mt-1',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        };
      case 'customer':
        return {
          card: 'bg-white text-gray-900 border-shop-border hover:border-gray-400 shadow-sm',
          title: 'text-emerald-800 font-medium text-xs uppercase tracking-wide',
          amount: 'text-emerald-700 text-2xl font-bold tracking-tight',
          subtitle: 'text-gray-500 text-xs mt-0.5',
          badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        };
      case 'digital':
        return {
          card: 'bg-white text-gray-900 border-shop-border hover:border-gray-400 shadow-sm',
          title: 'text-blue-800 font-medium text-xs uppercase tracking-wide',
          amount: 'text-blue-700 text-xl font-bold tracking-tight',
          subtitle: 'text-gray-500 text-xs mt-0.5',
          badge: 'bg-blue-50 text-blue-700 border border-blue-200',
        };
      case 'cash':
        return {
          card: 'bg-white text-gray-900 border-shop-border hover:border-gray-400 shadow-sm',
          title: 'text-gray-700 font-medium text-xs uppercase tracking-wide',
          amount: 'text-gray-900 text-xl font-bold tracking-tight',
          subtitle: 'text-gray-500 text-xs mt-0.5',
          badge: 'bg-gray-100 text-gray-800 border border-gray-200',
        };
      case 'expense':
        return {
          card: 'bg-white text-gray-900 border-shop-border hover:border-gray-400 shadow-sm',
          title: 'text-rose-800 font-medium text-xs uppercase tracking-wide',
          amount: 'text-rose-700 text-2xl font-bold tracking-tight',
          subtitle: 'text-gray-500 text-xs mt-0.5',
          badge: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      default:
        return {
          card: 'bg-white text-gray-900 border-shop-border hover:border-gray-400 shadow-sm',
          title: 'text-gray-600 font-medium text-xs uppercase tracking-wide',
          amount: 'text-gray-950 text-2xl font-bold tracking-tight',
          subtitle: 'text-gray-500 text-xs mt-0.5',
          badge: 'bg-gray-100 text-gray-700 border border-gray-200',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 ${styles.card} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={styles.title}>{title}</span>
        {variant === 'inhand' && (
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${styles.badge}`}>
            Final Cash
          </span>
        )}
      </div>

      <div className={`mt-1.5 ${styles.amount}`}>
        {formatINR(amount)}
      </div>

      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

      {subDetails && <div className="mt-3 pt-3 border-t border-gray-100">{subDetails}</div>}
    </div>
  );
}

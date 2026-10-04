import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Calendar,
  ChevronRight,
  RefreshCw,
  ReceiptText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/dashboardApi';
import { recordsApi } from '../services/recordsApi';
import { formatINR, formatDate, getTodayISO } from '../utils/formatters';
import { MoneyCard } from '../components/MoneyCard';
import { OfflineBanner, WakeUpBanner } from '../components/Banners';

export default function Dashboard() {
  const { user, shop } = useAuth();

  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'yesterday', 'custom'
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [summaryData, setSummaryData] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      let targetDate = selectedDate;
      const today = new Date();
      if (dateFilter === 'today') {
        targetDate = getTodayISO();
      } else if (dateFilter === 'yesterday') {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
        targetDate = yStr;
      }

      // Fetch summary strictly from backend database
      const summary = await dashboardApi.getSummary(targetDate);
      setSummaryData(summary);

      // Fetch recent records strictly for user's shop
      const records = await recordsApi.getRecords({ limit: 6 });
      setRecentRecords(records);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter, selectedDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Use values returned from PostgreSQL (0s if empty database, never hardcoded mock data)
  const totals = summaryData || {
    total_customer_money: 0.0,
    digital_received: 0.0,
    cash_received: 0.0,
    total_expenses: 0.0,
    own_money: 0.0,
    cash_box_expenses: 0.0,
    in_hand_money: 0.0,
    record_count: 0,
  };

  const ownerGreeting = user?.fullname ? `Mr. ${user.fullname}` : 'Owner';
  const shopName = shop?.name || 'Shop';

  return (
    <div className="pb-24 lg:pb-8 space-y-6">
      <OfflineBanner />
      <WakeUpBanner />

      {/* Dynamic Greeting & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-shop-border shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
            Hello, {ownerGreeting}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            {shopName} — Today's Summary
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'today'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'yesterday'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              Yesterday
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setDateFilter('custom');
              }}
              className="bg-transparent border-none p-0 text-xs font-semibold text-gray-800 focus:ring-0"
            />
          </div>

          <button
            onClick={loadDashboardData}
            className="p-2 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh numbers"
            aria-label="Refresh numbers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-gray-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* Database Status Alert when zero records */}
      {totals.record_count === 0 && !isLoading && (
        <div className="p-3.5 bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex items-center justify-between text-xs text-gray-600">
          <span>No kanakku entries recorded in database for this date. Showing ₹0.</span>
          <Link to="/scan" className="font-bold text-gray-950 underline hover:text-gray-700">
            + Scan Paper Slip
          </Link>
        </div>
      )}

      {/* 4-COLUMN RESPONSIVE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MoneyCard
          title="Total Customer Money"
          amount={totals.total_customer_money}
          subtitle="All receipts (Cash + Digital)"
          variant="customer"
        />

        <MoneyCard
          title="Digital Received"
          amount={totals.digital_received}
          subtitle="PhonePe, GPay, Bank refs"
          variant="digital"
        />

        <MoneyCard
          title="Cash Received"
          amount={totals.cash_received}
          subtitle="Customer Money − Digital"
          variant="cash"
        />

        <MoneyCard
          title="IN-HAND MONEY"
          amount={totals.in_hand_money}
          subtitle="Cash Received − Cash Box Exp"
          variant="inhand"
        />
      </div>

      {/* SECOND ROW (12-Column Responsive Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expenses Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-shop-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Section 3 — Total Expenses
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                Payments to dealers, agencies, suppliers, and shop costs
              </p>
            </div>
            <span className="text-2xl font-extrabold text-rose-700">
              {formatINR(totals.total_expenses)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                Personal Own Money
              </span>
              <div className="text-xl font-bold text-gray-900">
                {formatINR(totals.own_money)}
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                Paid from owner's personal pocket. <strong>Does not reduce cash box.</strong>
              </p>
            </div>

            <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
                Shop Cash Box Expenses
              </span>
              <div className="text-xl font-bold text-rose-700">
                {formatINR(totals.cash_box_expenses)}
              </div>
              <p className="text-[11px] text-rose-700 leading-tight">
                Deducted directly from Cash Received to determine final in-hand cash.
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span className="font-mono">In-Hand = ₹{totals.cash_received.toLocaleString('en-IN')} (Cash) − ₹{totals.cash_box_expenses.toLocaleString('en-IN')} (Cash Box)</span>
            <span className="font-bold text-gray-900 font-mono">= {formatINR(totals.in_hand_money)}</span>
          </div>
        </div>

        {/* Quick Action & Recent Database Records */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gray-950 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Scan Daily Slip</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Upload paper records to extract customer money & expenses.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <Link
              to="/scan"
              className="mt-4 w-full bg-white text-gray-950 font-semibold text-xs py-3 px-4 rounded-xl hover:bg-gray-100 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>+ Open Scanner</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-shop-border p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Recent Records
              </h3>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-gray-900 hover:underline flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {recentRecords.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                  <ReceiptText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">No records saved yet in database.</p>
                </div>
              ) : (
                recentRecords.slice(0, 4).map((rec) => (
                  <Link
                    key={rec.id}
                    to={`/transactions?id=${rec.id}`}
                    className="block bg-gray-50/70 hover:bg-gray-100 p-2.5 rounded-xl border border-gray-200 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-gray-900 mb-1">
                      <span>{formatDate(rec.record_date)}</span>
                      <span className="text-gray-950 font-bold">{formatINR(rec.in_hand_money)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Customer: {formatINR(rec.total_customer_money)}</span>
                      <span>Expenses: {formatINR(rec.total_expenses)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

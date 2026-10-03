import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Printer, RefreshCw, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { reportsApi } from '../services/reportsApi';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate, getTodayISO } from '../utils/formatters';
import { MoneyCard } from '../components/MoneyCard';
import { OfflineBanner } from '../components/Banners';

export default function Reports() {
  const { shop } = useAuth();
  const [reportType, setReportType] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      let data;
      if (reportType === 'daily') {
        data = await reportsApi.getDailyReport(selectedDate);
      } else if (reportType === 'weekly') {
        data = await reportsApi.getWeeklyReport(selectedDate);
      } else if (reportType === 'monthly') {
        const [year, month] = selectedDate.split('-');
        data = await reportsApi.getMonthlyReport(year, parseInt(month, 10));
      }
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setIsLoading(false);
    }
  }, [reportType, selectedDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handlePrint = () => {
    window.print();
  };

  const totals = report || {
    record_count: 0,
    total_customer_money: 0,
    total_digital_money: 0,
    total_cash_received: 0,
    total_expenses: 0,
    total_own_money: 0,
    total_cash_box_expenses: 0,
    total_in_hand_money: 0,
    period_label: '',
    records: [],
  };

  return (
    <div className="pb-24 lg:pb-8 space-y-6 print:p-0 print:max-w-none">
      <OfflineBanner />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-shop-border shadow-sm print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
            Financial Reports
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Aggregated accounting summaries for Chellam Traders
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            {['daily', 'weekly', 'monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  reportType === type
                    ? 'bg-white text-gray-950 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs">
            <input
              type={reportType === 'monthly' ? 'month' : 'date'}
              value={reportType === 'monthly' ? selectedDate.substring(0, 7) : selectedDate}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDate(reportType === 'monthly' ? `${val}-01` : val);
              }}
              className="bg-transparent border-none p-0 text-xs font-semibold text-gray-900 focus:ring-0"
            />
          </div>

          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors"
            title="Print or Save PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={loadReport}
            className="p-2 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block border-b-2 border-gray-900 pb-3 mb-4">
        <h1 className="text-2xl font-black text-gray-900">
          {shop?.name || totals.shop_name || 'Business Account'} — Financial Statement
        </h1>
        <p className="text-xs text-gray-600">
          Period: <strong>{totals.period_label || selectedDate}</strong> | Generated: {new Date().toLocaleString('en-IN')}
        </p>
      </div>

      {/* Scope Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            Report Period Scope
          </span>
          <span className="text-base font-extrabold text-gray-950">
            {totals.period_label || 'Selected Period'}
          </span>
        </div>
        <span className="text-xs font-bold text-gray-700 font-mono bg-white px-3 py-1.5 rounded-xl border border-gray-200">
          {totals.record_count} {totals.record_count === 1 ? 'Daily Record' : 'Daily Records'}
        </span>
      </div>

      {/* 4-COLUMN RESPONSIVE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MoneyCard
          title="Total Customer Money"
          amount={totals.total_customer_money}
          subtitle="All receipts in period"
          variant="customer"
        />

        <MoneyCard
          title="Digital Received"
          amount={totals.total_digital_money}
          subtitle="PhonePe / GPay / Bank"
          variant="digital"
        />

        <MoneyCard
          title="Cash Received"
          amount={totals.total_cash_received}
          subtitle="Customer − Digital"
          variant="cash"
        />

        <MoneyCard
          title="TOTAL IN-HAND CASH"
          amount={totals.total_in_hand_money}
          subtitle="Cash Received − Cash Box Exp"
          variant="inhand"
        />
      </div>

      {/* Expenses Breakdown Card */}
      <div className="bg-white rounded-2xl border border-shop-border p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Total Period Expenses
            </span>
            <span className="text-xs text-gray-500 block">Dealers, suppliers, and operating costs</span>
          </div>
          <span className="text-2xl font-extrabold text-rose-700">
            {formatINR(totals.total_expenses)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Own Money Paid</span>
            <span className="text-lg font-bold text-gray-900 mt-1 block">
              {formatINR(totals.total_own_money)}
            </span>
            <span className="text-[11px] text-gray-500">Not deducted from shop cash</span>
          </div>

          <div className="bg-rose-50/50 rounded-xl p-3.5 border border-rose-200">
            <span className="text-[10px] uppercase font-bold text-rose-800 block">Cash Box Expenses</span>
            <span className="text-lg font-bold text-rose-700 mt-1 block">
              {formatINR(totals.total_cash_box_expenses)}
            </span>
            <span className="text-[11px] text-rose-700">Deducted from shop cash</span>
          </div>
        </div>
      </div>

      {/* Day-by-day Breakdown Table */}
      {totals.records?.length > 0 && (
        <div className="bg-white rounded-2xl border border-shop-border overflow-hidden shadow-sm space-y-3 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Day-by-Day Detailed Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-y border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Customer Money</th>
                  <th className="py-3 px-4 text-right">Digital</th>
                  <th className="py-3 px-4 text-right">Cash Received</th>
                  <th className="py-3 px-4 text-right">Expenses</th>
                  <th className="py-3 px-4 text-right">Cash Box Exp</th>
                  <th className="py-3 px-4 text-right font-bold text-gray-950">In-Hand Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {totals.records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{formatDate(r.record_date)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      {formatINR(r.total_customer_money)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-blue-700">
                      {formatINR(r.total_digital_money)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-800">
                      {formatINR(r.total_cash_received)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600">
                      {formatINR(r.total_expenses)}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-700">
                      {formatINR(r.total_cash_box_expenses)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-950 text-sm">
                      {formatINR(r.in_hand_money)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  ReceiptText,
  X,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { recordsApi } from '../services/recordsApi';
import { API_BASE_URL } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import { OfflineBanner } from '../components/Banners';

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id');

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [error, setError] = useState('');

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await recordsApi.getRecords({
        record_date: filterDate || undefined,
        limit: 100,
      });
      setRecords(data);
    } catch (err) {
      console.error('Failed to load records:', err);
      setError('Could not fetch records list.');
    } finally {
      setIsLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const loadRecordDetail = async (id) => {
    setIsDetailLoading(true);
    try {
      const data = await recordsApi.getRecordById(id);
      setSelectedRecord(data);
    } catch (err) {
      console.error('Failed to load record details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      loadRecordDetail(initialId);
    }
  }, [initialId]);

  const handleDelete = async (id) => {
    try {
      await recordsApi.deleteRecord(id);
      setSelectedRecord(null);
      setDeleteConfirmId(null);
      loadRecords();
    } catch (err) {
      console.error('Failed to delete record:', err);
      alert('Failed to delete record.');
    }
  };

  return (
    <div className="pb-24 lg:pb-8 space-y-6">
      <OfflineBanner />

      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-shop-border shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
            Kanakku Records
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Historical daily accounting ledger records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent border-none p-0 text-xs font-semibold text-gray-900 focus:ring-0"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 ml-1"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={loadRecords}
            className="p-2.5 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading records...</div>
      ) : records.length === 0 ? (
        <div className="p-12 bg-white border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
          <ReceiptText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-800">No accounting records found</p>
          <p className="text-xs text-gray-500">
            {filterDate ? 'Try clearing or selecting a different date.' : 'Scan and confirm your first daily paper slip.'}
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW (< md): Card Layout */}
          <div className="md:hidden space-y-3">
            {records.map((rec) => (
              <div
                key={rec.id}
                onClick={() => loadRecordDetail(rec.id)}
                className="cursor-pointer bg-white p-4 rounded-2xl border border-shop-border hover:border-gray-400 active:scale-[0.99] transition-all shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-950 text-sm">{formatDate(rec.record_date)}</span>
                    <span className="text-[10px] text-gray-400 font-mono">#{rec.id}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Customer</span>
                    <span className="font-bold text-emerald-700">{formatINR(rec.total_customer_money)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Digital</span>
                    <span className="font-bold text-blue-700">{formatINR(rec.total_digital_money)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Expenses</span>
                    <span className="font-bold text-rose-600">{formatINR(rec.total_expenses)}</span>
                  </div>
                  <div className="bg-gray-950 text-white p-2 rounded-xl text-right">
                    <span className="text-[9px] text-gray-300 block uppercase font-bold">In-Hand Cash</span>
                    <span className="font-extrabold text-sm text-white">{formatINR(rec.in_hand_money)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TABLET / DESKTOP VIEW (>= md): Full Structured Data Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-shop-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Record ID</th>
                    <th className="py-3.5 px-4 text-right">Customer Money</th>
                    <th className="py-3.5 px-4 text-right">Digital</th>
                    <th className="py-3.5 px-4 text-right">Cash Received</th>
                    <th className="py-3.5 px-4 text-right">Expenses</th>
                    <th className="py-3.5 px-4 text-right font-bold text-gray-950">In-Hand Money</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      onClick={() => loadRecordDetail(rec.id)}
                    >
                      <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {formatDate(rec.record_date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500">#{rec.id}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                        {formatINR(rec.total_customer_money)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-blue-700">
                        {formatINR(rec.total_digital_money)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-gray-800">
                        {formatINR(rec.total_cash_received)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                        {formatINR(rec.total_expenses)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-gray-950 text-sm">
                        {formatINR(rec.in_hand_money)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadRecordDetail(rec.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-950 hover:text-white rounded-lg transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Record Detail Modal (Responsive: full-width on mobile, centered modal on desktop) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-lg text-gray-950">
                  {formatDate(selectedRecord.record_date)}
                </h3>
                <span className="text-xs text-gray-400 font-mono">Record #{selectedRecord.id}</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-gray-400 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Financial Highlight */}
              <div className="bg-gray-950 text-white p-4 rounded-xl shadow-sm space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  Chellam Traders Accounting Summary
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-400">Final Shop Cash In-Hand:</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {formatINR(selectedRecord.in_hand_money)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-800 text-gray-300">
                  <div>
                    Cash Received: <span className="text-white font-bold">{formatINR(selectedRecord.total_cash_received)}</span>
                  </div>
                  <div>
                    Cash Box Deducted: <span className="text-rose-400 font-bold">{formatINR(selectedRecord.total_cash_box_expenses)}</span>
                  </div>
                </div>
              </div>

              {/* Sections Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Section 1: Customer Receipts */}
                <div className="border border-gray-200 rounded-xl p-3.5 space-y-2 bg-gray-50/50">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-800 uppercase">
                    <span>Customer Money List</span>
                    <span>{formatINR(selectedRecord.total_customer_money)}</span>
                  </div>
                  <div className="space-y-1.5 divide-y divide-gray-100 text-xs">
                    {selectedRecord.customer_receipts?.length === 0 ? (
                      <p className="text-gray-400 italic">No customer receipts logged.</p>
                    ) : (
                      selectedRecord.customer_receipts.map((item, i) => (
                        <div key={i} className="pt-1.5 flex justify-between">
                          <span className="text-gray-600">{item.description || `Entry #${i + 1}`}</span>
                          <span className="font-bold text-gray-900">{formatINR(item.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Section 2: Digital Entries */}
                <div className="border border-gray-200 rounded-xl p-3.5 space-y-2 bg-gray-50/50">
                  <div className="flex justify-between items-center text-xs font-bold text-blue-800 uppercase">
                    <span>Digital References</span>
                    <span>{formatINR(selectedRecord.total_digital_money)}</span>
                  </div>
                  <div className="space-y-1.5 divide-y divide-gray-100 text-xs">
                    {selectedRecord.digital_entries?.length === 0 ? (
                      <p className="text-gray-400 italic">No digital entries logged.</p>
                    ) : (
                      selectedRecord.digital_entries.map((item, i) => (
                        <div key={i} className="pt-1.5 flex justify-between">
                          <span className="text-gray-600 font-mono">{item.raw_text || 'Digital ref'}</span>
                          <span className="font-bold text-blue-700">{formatINR(item.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Expenses Breakdown */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-rose-800 uppercase">
                  <span>Expenses Breakdown</span>
                  <span>{formatINR(selectedRecord.total_expenses)}</span>
                </div>
                <div className="space-y-2 divide-y divide-gray-100 text-xs">
                  {selectedRecord.expenses?.length === 0 ? (
                    <p className="text-gray-400 italic">No expenses logged.</p>
                  ) : (
                    selectedRecord.expenses.map((item, i) => (
                      <div key={i} className="pt-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 block">{item.description}</span>
                          <span className="text-[11px] text-gray-500">
                            Own: {formatINR(item.own_amount)} | <strong className="text-rose-600">Cash Box: {formatINR(item.cash_box_amount)}</strong>
                          </span>
                        </div>
                        <span className="font-extrabold text-gray-900 text-sm">
                          {formatINR(item.total_amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Original Ledger Image Link */}
              {selectedRecord.image_url && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-800">Original Paper Image</span>
                  </div>
                  <a
                    href={`${API_BASE_URL}${selectedRecord.image_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-gray-950 underline flex items-center gap-1 hover:text-gray-700"
                  >
                    Open Photo <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              {deleteConfirmId === selectedRecord.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-700 font-semibold">Confirm delete?</span>
                  <button
                    onClick={() => handleDelete(selectedRecord.id)}
                    className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-3 py-2 bg-gray-200 text-gray-800 text-xs font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(selectedRecord.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold py-2 px-3 rounded-lg border border-red-200 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

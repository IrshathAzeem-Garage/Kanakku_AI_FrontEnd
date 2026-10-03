import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Plus,
  Calendar,
  Sparkles,
  Info,
  ArrowLeft,
  Save,
  ZoomIn
} from 'lucide-react';
import { recordsApi } from '../services/recordsApi';
import { formatINR, formatDate, getTodayISO } from '../utils/formatters';
import { MoneyCard } from '../components/MoneyCard';
import { OfflineBanner } from '../components/Banners';

export default function Scan() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');

  // Review / Edit screen state
  const [isReviewing, setIsReviewing] = useState(false);
  const [recordDate, setRecordDate] = useState(getTodayISO());
  const [customerEntries, setCustomerEntries] = useState([]);
  const [digitalEntries, setDigitalEntries] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState([]);
  const [savedImageUrl, setSavedImageUrl] = useState('');
  const [savedImageHash, setSavedImageHash] = useState('');
  const [savedImageId, setSavedImageId] = useState('');
  const [savedRequestId, setSavedRequestId] = useState('');
  const [uncertainEntries, setUncertainEntries] = useState([]);
  const [warningMessage, setWarningMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSelectedFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newUrl = URL.createObjectURL(file);
    setPreviewUrl(newUrl);
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Analyze image with progressive UX
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select or capture a paper image first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setLoadingStep(`Analyzing ${selectedFile.name}...`);

    const step1Timer = setTimeout(() => {
      setLoadingStep('Reading visible entries...');
    }, 1200);

    const step2Timer = setTimeout(() => {
      setLoadingStep('Calculating four-section summary...');
    }, 2400);

    try {
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const data = await recordsApi.analyzeImage(selectedFile, requestId);

      clearTimeout(step1Timer);
      clearTimeout(step2Timer);

      setRecordDate(data.date || getTodayISO());
      setCustomerEntries(data.customer_money || []);
      setDigitalEntries(data.digital_entries || []);
      setExpenseEntries(data.expenses || []);
      setSavedImageUrl(data.image_url || '');
      setSavedImageHash(data.image_hash || '');
      setSavedImageId(data.image_id || '');
      setSavedRequestId(data.request_id || requestId);
      setUncertainEntries(data.uncertain_entries || []);
      setWarningMessage(data.warning_message || '');

      setIsReviewing(true);
    } catch (err) {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      console.error('Analysis failed:', err);
      setError(
        err.response?.data?.detail ||
          'Failed to analyze image. Please ensure the paper is clear and readable, and retry.'
      );
    } finally {
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  // Section 1: Customer money row handlers
  const handleCustomerChange = (index, field, value) => {
    const updated = [...customerEntries];
    updated[index] = { ...updated[index], [field]: value };
    setCustomerEntries(updated);
  };

  const addCustomerRow = () => {
    setCustomerEntries([...customerEntries, { amount: '', description: '', needs_review: false }]);
  };

  const removeCustomerRow = (index) => {
    setCustomerEntries(customerEntries.filter((_, i) => i !== index));
  };

  // Section 2: Digital entry row handlers
  const handleDigitalChange = (index, field, value) => {
    const updated = [...digitalEntries];
    updated[index] = { ...updated[index], [field]: value };
    setDigitalEntries(updated);
  };

  const addDigitalRow = () => {
    setDigitalEntries([...digitalEntries, { amount: '', raw_text: 'PP - ', needs_review: false }]);
  };

  const removeDigitalRow = (index) => {
    setDigitalEntries(digitalEntries.filter((_, i) => i !== index));
  };

  // Section 3: Expense row handlers
  const handleExpenseChange = (index, field, value) => {
    const updated = [...expenseEntries];
    const item = { ...updated[index], [field]: value };

    if (field === 'own_amount' || field === 'cash_box_amount') {
      const own = parseFloat(field === 'own_amount' ? value : item.own_amount) || 0;
      const cbox = parseFloat(field === 'cash_box_amount' ? value : item.cash_box_amount) || 0;
      item.total_amount = Number((own + cbox).toFixed(2));
    } else if (field === 'total_amount') {
      const tot = parseFloat(value) || 0;
      const own = parseFloat(item.own_amount) || 0;
      item.cash_box_amount = Math.max(0, Number((tot - own).toFixed(2)));
    }

    updated[index] = item;
    setExpenseEntries(updated);
  };

  const addExpenseRow = () => {
    setExpenseEntries([
      ...expenseEntries,
      { description: '', total_amount: '', own_amount: 0, cash_box_amount: '', needs_review: false },
    ]);
  };

  const removeExpenseRow = (index) => {
    setExpenseEntries(expenseEntries.filter((_, i) => i !== index));
  };

  // Dynamic Live Financial Calculations (Rules 1-9)
  const totalCustomerMoney = customerEntries.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const totalDigitalMoney = digitalEntries.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const totalCashReceived = Number((totalCustomerMoney - totalDigitalMoney).toFixed(2));

  const totalExpenses = expenseEntries.reduce(
    (sum, item) => sum + (parseFloat(item.total_amount) || 0),
    0
  );
  const totalOwnMoney = expenseEntries.reduce(
    (sum, item) => sum + (parseFloat(item.own_amount) || 0),
    0
  );
  const totalCashBoxExpenses = expenseEntries.reduce(
    (sum, item) => sum + (parseFloat(item.cash_box_amount) || 0),
    0
  );

  const inHandMoney = Number((totalCashReceived - totalCashBoxExpenses).toFixed(2));

  // Save confirmed record to backend
  const handleConfirmAndSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        record_date: recordDate,
        customer_receipts: customerEntries
          .filter((item) => parseFloat(item.amount) > 0)
          .map((item) => ({
            amount: parseFloat(item.amount),
            description: item.description || '',
            payment_type: 'UNKNOWN',
          })),
        digital_entries: digitalEntries
          .filter((item) => parseFloat(item.amount) > 0)
          .map((item) => ({
            amount: parseFloat(item.amount),
            raw_text: item.raw_text || '',
          })),
        expenses: expenseEntries
          .filter((item) => parseFloat(item.total_amount) > 0)
          .map((item) => ({
            description: item.description || 'Expense',
            total_amount: parseFloat(item.total_amount),
            own_amount: parseFloat(item.own_amount || 0),
            cash_box_amount: parseFloat(item.cash_box_amount || 0),
            raw_text: item.raw_text || '',
          })),
        image_url: savedImageUrl,
        image_hash: savedImageHash,
      };

      await recordsApi.createRecord(payload);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save record:', err);
      setError(err.response?.data?.detail || 'Failed to save record to database. Please check entries.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-24 lg:pb-8 space-y-6">
      <OfflineBanner />

      {/* Screen 1: Image Upload / Capture */}
      {!isReviewing ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-shop-border pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
                Scan Today's Kanakku
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Capture the handwritten daily paper record with phone camera or upload a file
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id="camera-input"
          />

          {!previewUrl ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Camera Capture Card */}
              <label
                htmlFor="camera-input"
                className="cursor-pointer bg-gray-950 text-white font-medium p-8 sm:p-12 rounded-2xl flex flex-col items-center justify-center gap-4 border border-gray-900 shadow-sm hover:bg-gray-900 active:scale-[0.99] transition-all text-center"
              >
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold block">+ Capture with Phone Camera</span>
                  <span className="text-xs text-gray-400 mt-1 block">
                    Optimized for mobile paper photography
                  </span>
                </div>
              </label>

              {/* Secondary Upload / Gallery Card */}
              <div
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
                className="cursor-pointer bg-white p-8 sm:p-12 rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-900 hover:bg-gray-50 flex flex-col items-center justify-center gap-4 transition-all text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-700" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 block">
                    Choose from Gallery / Files
                  </span>
                  <span className="text-xs text-gray-500 mt-1 block">
                    Supports JPG, PNG, WEBP, HEIC (up to 15MB)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop/Tablet Preview & Analyze Container */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Image Preview */}
              <div className="lg:col-span-6 bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
                <div className="relative aspect-[3/4] max-h-[500px] w-full flex items-center justify-center p-2">
                  <img
                    src={previewUrl}
                    alt="Paper Preview"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>

                <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between text-xs sm:text-sm">
                  <div className="truncate max-w-[280px]">
                    <span className="font-bold block truncate text-gray-900">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'image/jpeg'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="camera-input"
                      className="cursor-pointer px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                    >
                      Replace
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Guidance */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-shop-border shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-gray-950">Ready to Analyze</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    KANAKKU AI will inspect the paper layout, identify the right-side customer receipts, parse left-side digital references, and categorize expenses into personal own money vs. shop cash box.
                  </p>

                  {isAnalyzing ? (
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-3">
                      <div className="w-10 h-10 border-3 border-gray-950 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-950">{loadingStep}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Extracting customer receipts, digital entries, and dealer payments...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      className="w-full bg-gray-950 text-white font-semibold py-4 px-6 rounded-xl hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md text-sm"
                    >
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>Analyze Kanakku with AI</span>
                    </button>
                  )}
                </div>

                {/* Helpful Tips Card */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs text-gray-600">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-gray-700" /> Recognition Guidelines:
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-gray-500">
                    <li>Ensure handwriting amounts are not cut off at paper edges</li>
                    <li>Supports Tamil & English dealer labels (e.g. Aachi, Dealer, Cartage)</li>
                    <li>Every entry is fully editable before final saving to the database</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Screen 2: Responsive Two-Column Review Screen on Desktop */
        <div className="space-y-6">
          {/* Top Bar with Back, Date and Primary Save Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-shop-border shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsReviewing(false)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                title="Back to Image"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-950">Review Kanakku</h2>
                <p className="text-xs text-gray-500">Verify extracted numbers side-by-side</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="bg-transparent border-none p-0 text-xs font-semibold text-gray-900 focus:ring-0"
                />
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmAndSave}
                className="hidden sm:inline-flex bg-gray-950 text-white font-semibold text-xs py-2.5 px-4 rounded-xl hover:bg-gray-800 transition-all items-center gap-1.5 shadow-sm disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Confirm & Save
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Audit & Image Identity Info Bar */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-mono text-gray-600 flex flex-wrap items-center justify-between gap-2">
            <div><span className="font-semibold text-gray-500">Request:</span> {savedRequestId || 'N/A'}</div>
            <div><span className="font-semibold text-gray-500">Image ID:</span> {savedImageId || 'N/A'}</div>
            <div className="truncate max-w-xs"><span className="font-semibold text-gray-500">SHA-256:</span> {savedImageHash ? `${savedImageHash.substring(0, 16)}...` : 'N/A'}</div>
          </div>

          {uncertainEntries.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                Image Reading Notice (Zero-Fabrication Policy)
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {uncertainEntries.map((u, i) => (
                  <li key={i}>{typeof u === 'object' ? u.reason : u}</li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-800 font-medium">
                KANAKKU AI strictly adheres to the Absolute No-Hallucination rule. The system never invents numbers. Please review and input values manually if needed.
              </p>
            </div>
          )}

          {warningMessage && !uncertainEntries.length && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{warningMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}


          {/* TWO-COLUMN DESKTOP WORKSPACE:
              Left (col-span-5): Sticky Original Ledger Photo Preview
              Right (col-span-7): Sections 1, 2, 3 and 4 with live totals
          */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sticky Original Image (Desktop) */}
            <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3">
              <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
                <div className="p-2.5 bg-gray-950 text-white flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-gray-400" /> Original Paper Slip
                  </span>
                  <span className="text-[11px] text-gray-400">Side-by-side reference</span>
                </div>
                <div className="relative aspect-[3/4] max-h-[600px] w-full flex items-center justify-center p-2 bg-gray-900">
                  <img
                    src={previewUrl}
                    alt="Original Slip"
                    className="max-h-full max-w-full object-contain rounded-lg shadow"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Four Sections Data & Calculations */}
            <div className="lg:col-span-7 space-y-6">
              {/* SECTION 1: Customer Money (Right-Side of Paper) */}
              <div className="bg-white rounded-2xl border border-shop-border p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Section 1 — Customer Money
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      Right-side amounts under the date
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomerRow}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-2">
                  {customerEntries.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border ${
                        item.needs_review
                          ? 'border-amber-300 bg-amber-50/50'
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={item.amount ?? ''}
                          onChange={(e) => handleCustomerChange(idx, 'amount', e.target.value)}
                          className="w-full text-sm font-bold text-gray-900 bg-transparent"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={item.description || ''}
                        onChange={(e) => handleCustomerChange(idx, 'description', e.target.value)}
                        className="text-xs text-gray-600 bg-transparent hidden sm:block w-36"
                      />

                      {item.needs_review && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                          Verify
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeCustomerRow(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-bold">
                  <span className="text-gray-600">Total Customer Money:</span>
                  <span className="text-emerald-700 text-base">{formatINR(totalCustomerMoney)}</span>
                </div>
              </div>

              {/* SECTION 2: Digital References (PhonePe, GPay, Bank) */}
              <div className="bg-white rounded-2xl border border-shop-border p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      Section 2 — Digital References
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      PP, GPay, Bank (Included in Customer Money — NOT added again)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addDigitalRow}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-2">
                  {digitalEntries.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-1">No digital entries identified.</p>
                  ) : (
                    digitalEntries.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border ${
                          item.needs_review
                            ? 'border-amber-300 bg-amber-50/50'
                            : 'border-gray-200 bg-gray-50/50'
                        }`}
                      >
                        <div className="w-32">
                          <input
                            type="text"
                            placeholder="Ref (PP/GPay)"
                            value={item.raw_text || ''}
                            onChange={(e) => handleDigitalChange(idx, 'raw_text', e.target.value)}
                            className="w-full text-xs font-medium text-gray-600 bg-transparent"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm text-gray-400 font-bold">₹</span>
                          <input
                            type="number"
                            step="any"
                            placeholder="0"
                            value={item.amount ?? ''}
                            onChange={(e) => handleDigitalChange(idx, 'amount', e.target.value)}
                            className="w-full text-sm font-bold text-gray-900 bg-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDigitalRow(idx)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-bold">
                  <span className="text-gray-600">Total Digital Received:</span>
                  <span className="text-blue-700 text-base">{formatINR(totalDigitalMoney)}</span>
                </div>
              </div>

              {/* SECTION 3: Expenses (Dealers, Suppliers, Shop costs) */}
              <div className="bg-white rounded-2xl border border-shop-border p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                      Section 3 — Expenses
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      Own Money does NOT reduce shop cash box
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addExpenseRow}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1 bg-rose-50 rounded-lg border border-rose-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Expense
                  </button>
                </div>

                <div className="space-y-3">
                  {expenseEntries.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-1">No expenses recorded.</p>
                  ) : (
                    expenseEntries.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border space-y-2.5 ${
                          item.needs_review
                            ? 'border-amber-300 bg-amber-50/50'
                            : 'border-gray-200 bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <input
                            type="text"
                            placeholder="Description (e.g. Aachi, Oil Supplier)"
                            value={item.description || ''}
                            onChange={(e) => handleExpenseChange(idx, 'description', e.target.value)}
                            className="text-sm font-bold text-gray-900 bg-transparent flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeExpenseRow(idx)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase font-semibold">
                              Total Expense
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-gray-400 font-bold">₹</span>
                              <input
                                type="number"
                                step="any"
                                placeholder="0"
                                value={item.total_amount ?? ''}
                                onChange={(e) =>
                                  handleExpenseChange(idx, 'total_amount', e.target.value)
                                }
                                className="w-full text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1.5"
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase font-semibold">
                              Own Money
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-gray-400 font-bold">₹</span>
                              <input
                                type="number"
                                step="any"
                                placeholder="0"
                                value={item.own_amount ?? 0}
                                onChange={(e) =>
                                  handleExpenseChange(idx, 'own_amount', e.target.value)
                                }
                                className="w-full text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5"
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-rose-600 block uppercase font-bold">
                              Cash Box
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-gray-400 font-bold">₹</span>
                              <input
                                type="number"
                                step="any"
                                placeholder="0"
                                value={item.cash_box_amount ?? ''}
                                onChange={(e) =>
                                  handleExpenseChange(idx, 'cash_box_amount', e.target.value)
                                }
                                className="w-full text-xs font-bold text-rose-700 bg-white border border-rose-200 rounded-lg px-2 py-1.5"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500 block">Total Expenses:</span>
                    <span className="text-gray-900 font-bold text-sm">{formatINR(totalExpenses)}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500 block">Own Money Paid:</span>
                    <span className="text-gray-900 font-bold text-sm">{formatINR(totalOwnMoney)}</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                    <span className="text-rose-700 block">Cash Box Deducted:</span>
                    <span className="text-rose-800 font-bold text-sm">{formatINR(totalCashBoxExpenses)}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Live Calculated In-Hand Money Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-shop-border shadow-sm">
                  <span className="text-xs font-bold uppercase text-gray-500 block">
                    Cash Received
                  </span>
                  <span className="text-2xl font-extrabold text-gray-950 mt-1 block">
                    {formatINR(totalCashReceived)}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block">
                    Customer Money ({formatINR(totalCustomerMoney)}) − Digital ({formatINR(totalDigitalMoney)})
                  </span>
                </div>

                <MoneyCard
                  title="IN-HAND MONEY"
                  amount={inHandMoney}
                  subtitle="Cash Received − Cash Box Expenses"
                  variant="inhand"
                />
              </div>

              {/* Bottom Confirm and Save Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleConfirmAndSave}
                  className="flex-1 bg-gray-950 text-white font-semibold py-4 px-6 rounded-xl hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60 text-sm"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving to Chellam Traders database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span>Confirm & Save Kanakku</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsReviewing(false)}
                  className="sm:w-auto bg-white text-gray-700 font-semibold py-4 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 active:scale-[0.99] transition-all text-xs"
                >
                  Back to Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

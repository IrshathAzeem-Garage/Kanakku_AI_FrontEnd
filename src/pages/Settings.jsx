import React, { useState, useEffect } from 'react';
import {
  User,
  Store,
  Server,
  LogOut,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Save,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBackendStatus } from '../context/BackendStatusContext';
import { API_BASE_URL, wakeBackend } from '../services/api';
import { OfflineBanner } from '../components/Banners';

export default function Settings() {
  const { user, shop, updateUserProfile, updateShopDetails, logout } = useAuth();
  const { isHealthy } = useBackendStatus();

  // Profile Form State
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Shop Form State
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [shopSaving, setShopSaving] = useState(false);
  const [shopSuccess, setShopSuccess] = useState('');
  const [shopError, setShopError] = useState('');

  // Server Ping State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (user) {
      setFullname(user.fullname || '');
      setEmail(user.email || '');
      setWhatsappNumber(user.whatsapp_number || '');
    }
  }, [user]);

  useEffect(() => {
    if (shop) {
      setShopName(shop.name || '');
      setPhone(shop.phone || '');
      setAddress(shop.address || '');
      setCurrency(shop.currency || 'INR');
      setTimezone(shop.timezone || 'Asia/Kolkata');
    }
  }, [shop]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      await updateUserProfile({
        fullname,
        email,
        whatsapp_number: whatsappNumber,
      });
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setProfileError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveShop = async (e) => {
    e.preventDefault();
    setShopSaving(true);
    setShopSuccess('');
    setShopError('');
    try {
      await updateShopDetails({
        name: shopName,
        phone,
        address,
        currency,
        timezone,
      });
      setShopSuccess('Shop configuration updated successfully.');
      setTimeout(() => setShopSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to update shop:', err);
      setShopError(err.response?.data?.detail || 'Failed to update shop.');
    } finally {
      setShopSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const ok = await wakeBackend();
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: ok,
        latency,
        message: ok ? `Connected successfully (${latency}ms)` : 'Connection timed out or failed.',
      });
    } catch (err) {
      setTestResult({ success: false, message: 'Server ping failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="pb-24 lg:pb-8 space-y-6">
      <OfflineBanner />

      <div className="border-b border-shop-border pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
          Settings & Configuration
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Database-driven profile and business information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: User Profile & Shop Settings Forms */}
        <div className="space-y-6">
          {/* USER PROFILE FORM */}
          <div className="bg-white rounded-2xl border border-shop-border p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-4 h-4 text-gray-700" />
              <h3 className="font-bold text-gray-950 text-sm">Shop Owner Profile</h3>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="e.g. Mohamed Iqbal"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-gray-950"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. iqbal@chellamtraders.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-gray-950"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-700 font-semibold">
                    Contact Phone Number
                  </label>
                  {whatsappNumber ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Saved
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                      Optional
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 bg-white focus:border-gray-950 font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Primary business contact phone number. Daily accounting PDF reports are automatically dispatched directly to the configured Gmail address.
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500">
                <span>Username: <strong className="font-mono text-gray-800">@{user?.username}</strong></span>
                <span>Role: <strong className="capitalize text-emerald-700">{user?.role || 'Owner'}</strong></span>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full mt-2 bg-gray-950 hover:bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{profileSaving ? 'Saving to Database...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>

          {/* SHOP SETTINGS FORM */}
          <div className="bg-white rounded-2xl border border-shop-border p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Store className="w-4 h-4 text-gray-700" />
              <h3 className="font-bold text-gray-950 text-sm">Shop Configuration</h3>
            </div>

            {shopSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{shopSuccess}</span>
              </div>
            )}

            {shopError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{shopError}</span>
              </div>
            )}

            <form onSubmit={handleSaveShop} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Shop / Business Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Chellam Traders"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 bg-white focus:border-gray-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="INR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Shop Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Market / street address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Asia/Kolkata"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={shopSaving}
                className="w-full mt-2 bg-gray-950 hover:bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs shadow-sm disabled:opacity-50"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{shopSaving ? 'Updating Shop...' : 'Save Shop Configuration'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Server Diagnostic & Logout */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-shop-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-700" />
                <h4 className="font-bold text-gray-950 text-sm">Backend Health & Diagnostic</h4>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold ${
                  isHealthy
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`}
                />
                {isHealthy ? 'Service Online' : 'Waking Up'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">API Endpoint:</span>
                <span className="font-mono text-xs text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate max-w-[260px]">
                  {API_BASE_URL}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Current Timezone:</span>
                <span className="font-semibold text-gray-900">{shop?.timezone || 'Asia/Kolkata'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Shop ID:</span>
                <span className="font-mono text-gray-900">#{shop?.id || 1}</span>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Pinging /api/health endpoint...' : 'Test Backend Connection'}</span>
            </button>
          </div>

          {/* PWA / App info */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 text-gray-950 font-bold">
              <Smartphone className="w-4 h-4 text-gray-700" />
              <span>Mobile Phone Web App</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              KANAKKU AI is designed mobile-first for daily wholesale accounting. Add to home screen for an app-like experience on Android or iOS.
            </p>
          </div>

          {/* Logout Action */}
          <button
            onClick={logout}
            className="w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-3.5 px-4 rounded-2xl border border-red-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of KANAKKU AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}

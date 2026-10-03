import React from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { useBackendStatus } from '../context/BackendStatusContext';

export function OfflineBanner() {
  const { isOffline } = useBackendStatus();

  if (!isOffline) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-800 flex items-center justify-center gap-2 font-medium">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span>You're offline. Please connect to the internet to analyze or save today's kanakku.</span>
    </div>
  );
}

export function WakeUpBanner() {
  const { isWakingUp, wakeAttempt } = useBackendStatus();

  if (!isWakingUp) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between font-medium">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        <span>Waking up Chellam Traders server... please wait a few seconds.</span>
      </div>
      <span className="text-[11px] text-amber-600 font-mono">Attempt {wakeAttempt}/4</span>
    </div>
  );
}

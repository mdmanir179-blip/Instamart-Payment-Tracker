import React from 'react';
import { 
  Clock, 
  FileSpreadsheet, 
  Database, 
  CheckCircle2, 
  UploadCloud, 
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { LedgerMetadata } from '../services/ledgerSyncService';

interface LastUploadCardProps {
  metadata: LedgerMetadata | null;
  totalInvoices: number;
  totalPayments: number;
  isSyncing: boolean;
  onOpenUpload: () => void;
  onManualRefresh?: () => void;
}

export const LastUploadCard: React.FC<LastUploadCardProps> = ({
  metadata,
  totalInvoices,
  totalPayments,
  isSyncing,
  onOpenUpload,
  onManualRefresh,
}) => {
  // Format date nicely
  const formatUploadDateTime = (isoString?: string) => {
    if (!isoString) return { dateStr: 'Not Available', timeStr: '', relativeStr: '' };
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { dateStr: isoString, timeStr: '', relativeStr: '' };

      const dateStr = d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const timeStr = d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Relative calculation
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relativeStr = 'Just now';
      if (diffMins > 0 && diffMins < 60) {
        relativeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0 && diffHours < 24) {
        relativeStr = `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays > 0) {
        relativeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      }

      return { dateStr, timeStr, relativeStr };
    } catch {
      return { dateStr: isoString, timeStr: '', relativeStr: '' };
    }
  };

  const uploadInfo = formatUploadDateTime(metadata?.lastUploadedAt);

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-400/10 dark:via-amber-400/5 dark:to-transparent border border-amber-300 dark:border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-xs transition-colors mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Main Upload Status & Timestamp */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>Last Data Sheet Upload</span>
              </span>

              {/* Live Database Sync Badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Database Synced</span>
              </span>

              {uploadInfo.relativeStr && metadata?.lastUploadedAt && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {uploadInfo.relativeStr}
                </span>
              )}
            </div>

            {/* Date & Time Display */}
            {metadata?.lastUploadedAt ? (
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 inline" />
                  <span>{uploadInfo.dateStr}</span>
                  <span className="text-amber-600 dark:text-amber-400 text-sm font-semibold">
                    at {uploadInfo.timeStr}
                  </span>
                </h2>
              </div>
            ) : (
              <div className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                No data sheet uploaded yet to the cloud database.
              </div>
            )}

            {/* File & Details row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
              {metadata?.lastUploadFileName && (
                <div className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {metadata.lastUploadFileName}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {totalInvoices} Invoices · {totalPayments} Payments
                </span>
              </div>

              {metadata?.vendorName && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Vendor:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {metadata.vendorName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cloud Sync Guarantee & Upload Trigger */}
        <div className="flex flex-wrap items-center gap-2 lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0 border-amber-200/60 dark:border-amber-900/40">
          <div className="hidden sm:block text-right mr-2 text-[11px] text-slate-500 dark:text-slate-400 max-w-[210px] leading-tight">
            <span>Everyone with this software sees this exact same data in real time.</span>
          </div>

          {onManualRefresh && (
            <button
              onClick={onManualRefresh}
              disabled={isSyncing}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
              title="Refresh database sync"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Data Sheet</span>
          </button>
        </div>

      </div>
    </div>
  );
};

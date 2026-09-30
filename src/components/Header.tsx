import React from 'react';
import { ViewTab } from '../types';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  CreditCard, 
  GitCompare, 
  Clock, 
  Upload, 
  Download, 
  Sun, 
  Moon,
  Trash2
} from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  onClearData: () => void;
  vendorName: string;
  totalInvoices: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenUpload,
  onOpenExport,
  onClearData,
  vendorName,
  totalInvoices,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 sticky top-0 z-40 transition-colors">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-sm">
              IM
            </div>
            <div>
              <a href="#" className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Instamart Payment Tracker
              </a>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                <span>{totalInvoices > 0 ? (vendorName || 'Active Ledger') : 'No Dataset Loaded'}</span>
                <span aria-hidden="true">·</span>
                <span>{totalInvoices} Invoices</span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links / View Tabs */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onTabChange('invoices')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'invoices'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Invoice Ledger</span>
            </button>

            <button
              onClick={() => onTabChange('payments')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'payments'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Report</span>
            </button>

            <button
              onClick={() => onTabChange('reconciliation')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'reconciliation'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Reconciliation</span>
            </button>

            <button
              onClick={() => onTabChange('aging')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'aging'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Aging & Overdue</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions + Theme Toggle */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Clear Data button if data exists */}
            {totalInvoices > 0 && (
              <button
                onClick={onClearData}
                title="Clear current dataset"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Upload Report</span>
            </button>

            <button
              onClick={onOpenExport}
              disabled={totalInvoices === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

        </div>

        {/* Mobile Nav Tabs */}
        <div className="lg:hidden flex items-center gap-1 py-2 overflow-x-auto border-t border-slate-200 dark:border-slate-800/60 no-scrollbar">
          {(['dashboard', 'invoices', 'payments', 'reconciliation', 'aging'] as ViewTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize whitespace-nowrap ${
                currentTab === tab 
                  ? 'bg-amber-400 text-slate-950 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { ViewTab, InvoiceRecord, PaymentRecord } from './types';
import { INITIAL_INVOICES, INITIAL_PAYMENTS, deriveInitialPayments } from './data/initialData';
import { calculateFinancialSummary } from './utils/summaryCalculator';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { InvoiceTable } from './components/InvoiceTable';
import { PaymentReportTable } from './components/PaymentReportTable';
import { ReconciliationView } from './components/ReconciliationView';
import { AgingAnalysisView } from './components/AgingAnalysisView';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { UploadModal } from './components/UploadModal';
import { ExportModal } from './components/ExportModal';
import { PrintStatement } from './components/PrintStatement';
import { Upload, FileSpreadsheet, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Requirement 4: Demo data removed by default - starts with empty data
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('instamart_invoices');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('instamart_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Requirement 2: Screen color light and dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('instamart_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('instamart_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      if (invoices.length > 0) {
        localStorage.setItem('instamart_invoices', JSON.stringify(invoices));
      } else {
        localStorage.removeItem('instamart_invoices');
      }
    } catch {
      // ignore
    }
  }, [invoices]);

  useEffect(() => {
    try {
      if (payments.length > 0) {
        localStorage.setItem('instamart_payments', JSON.stringify(payments));
      } else {
        localStorage.removeItem('instamart_payments');
      }
    } catch {
      // ignore
    }
  }, [payments]);

  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  
  // Interactive filters & modals
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>(undefined);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Financial summary computation
  const summary = useMemo(() => {
    return calculateFinancialSummary(invoices);
  }, [invoices]);

  // Vendor & Customer details from first record if loaded
  const vendorName = invoices[0]?.vendorName || (payments[0]?.vendorName ?? '');

  // Handle uploaded invoices
  const handleInvoicesLoaded = (newInvoices: InvoiceRecord[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setInvoices(newInvoices);
      setPayments(deriveInitialPayments(newInvoices));
    } else {
      setInvoices(prev => [...prev, ...newInvoices]);
      const newDerived = deriveInitialPayments(newInvoices);
      setPayments(prev => [...prev, ...newDerived]);
    }
  };

  // Handle uploaded payments
  const handlePaymentsLoaded = (newPayments: PaymentRecord[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setPayments(newPayments);
    } else {
      setPayments(prev => [...prev, ...newPayments]);
    }
  };

  // Clear all data
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear current invoices and payments?')) {
      setInvoices([]);
      setPayments([]);
      setSelectedWarehouse(undefined);
      try {
        localStorage.removeItem('instamart_invoices');
        localStorage.removeItem('instamart_payments');
      } catch {
        // ignore
      }
    }
  };

  // Optional: Load sample benchmark data if user specifically requests it
  const handleLoadSampleData = () => {
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setSelectedWarehouse(undefined);
  };

  // Filter actions from KPI cards
  const handleFilterOverdue = () => {
    setCurrentTab('invoices');
  };

  const handleFilterNotDue = () => {
    setCurrentTab('invoices');
  };

  const handleFilterPaid = () => {
    setCurrentTab('invoices');
  };

  const handleSelectWarehouse = (wh: string) => {
    setSelectedWarehouse(wh);
    setCurrentTab('invoices');
  };

  const handleSelectInvoiceNumber = (invNum: string) => {
    const found = invoices.find(i => i.invoiceNumber.toLowerCase() === invNum.toLowerCase());
    if (found) {
      setSelectedInvoice(found);
    } else {
      setCurrentTab('invoices');
    }
  };

  const hasData = invoices.length > 0 || payments.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors">
      
      {/* Header navigation bar adhering to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onClearData={handleClearData}
        vendorName={vendorName}
        totalInvoices={invoices.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* If no data loaded, show clean welcome & upload invitation */}
        {!hasData ? (
          <div className="max-w-2xl mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-lg transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <FileSpreadsheet className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              Welcome to Instamart Payment Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              Upload your Excel (.xlsx, .xls) or CSV Invoice & Payment reports to track total sales, overdue balances, net payable amounts, and bank UTR settlements.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Excel / CSV Report</span>
              </button>

              <button
                onClick={handleLoadSampleData}
                className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Load Benchmark 37 Invoices (Sample)
              </button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-left text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Point 1: 34 Fields</div>
                  <div className="text-slate-500 text-[11px]">Gross sales, PO/GRN, TDS, returns, net payable</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Point 2: 13 Fields</div>
                  <div className="text-slate-500 text-[11px]">Bank UTR, remittance, reversals, net credit</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">100% INR Accounting</div>
                  <div className="text-slate-500 text-[11px]">Accurate currency calculations & export</div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <>
            {/* KPI Metric Cards displayed on top of dashboard & ledger */}
            <MetricCards
              summary={summary}
              onFilterOverdue={handleFilterOverdue}
              onFilterNotDue={handleFilterNotDue}
              onFilterPaid={handleFilterPaid}
            />

            {/* Tab 1: Dashboard View */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <AnalyticsCharts
                  invoices={invoices}
                  summary={summary}
                  onSelectWarehouse={handleSelectWarehouse}
                />

                {/* Live Invoices Register */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active Invoice Register</h3>
                    <button
                      onClick={() => setCurrentTab('invoices')}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                    >
                      View All {invoices.length} Invoices &rarr;
                    </button>
                  </div>

                  <InvoiceTable
                    invoices={invoices}
                    onSelectInvoice={(inv) => setSelectedInvoice(inv)}
                    selectedWarehouse={selectedWarehouse}
                    onClearWarehouseFilter={() => setSelectedWarehouse(undefined)}
                    onOpenUpload={() => setIsUploadOpen(true)}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Full Invoice Ledger View */}
            {currentTab === 'invoices' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Invoice Master Register</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Comprehensive audit view for all 34 Instamart invoice report fields with multi-parameter search.
                    </p>
                  </div>
                </div>

                <InvoiceTable
                  invoices={invoices}
                  onSelectInvoice={(inv) => setSelectedInvoice(inv)}
                  selectedWarehouse={selectedWarehouse}
                  onClearWarehouseFilter={() => setSelectedWarehouse(undefined)}
                  onOpenUpload={() => setIsUploadOpen(true)}
                />
              </div>
            )}

            {/* Tab 3: Point 2 Payment Report Ledger */}
            {currentTab === 'payments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment Report Ledger (Point 2)</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bank remittance details, payment numbers, UTR reference codes, and reversals.
                    </p>
                  </div>
                </div>

                <PaymentReportTable
                  payments={payments}
                  invoices={invoices}
                  onSelectInvoiceNumber={handleSelectInvoiceNumber}
                  onOpenUpload={() => setIsUploadOpen(true)}
                />
              </div>
            )}

            {/* Tab 4: Automated Reconciliation Hub */}
            {currentTab === 'reconciliation' && (
              <ReconciliationView
                invoices={invoices}
                payments={payments}
                summary={summary}
                onSelectInvoice={(inv) => setSelectedInvoice(inv)}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            )}

            {/* Tab 5: Aging & Overdue Recovery */}
            {currentTab === 'aging' && (
              <AgingAnalysisView
                invoices={invoices}
                summary={summary}
                onSelectInvoice={(inv) => setSelectedInvoice(inv)}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 transition-colors">
        <p>Instamart Payment Tracker · Autonomous Vendor Finance & Reconciliation Engine</p>
      </footer>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      {/* Excel & CSV Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onInvoicesLoaded={handleInvoicesLoaded}
        onPaymentsLoaded={handlePaymentsLoaded}
        onLoadSample={handleLoadSampleData}
      />

      {/* Export Reports Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        invoices={invoices}
        payments={payments}
        summary={summary}
      />

      {/* Hidden Printable Vendor Statement for Window Print */}
      <PrintStatement
        invoices={invoices}
        payments={payments}
        summary={summary}
      />

    </div>
  );
}

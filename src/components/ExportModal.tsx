import React from 'react';
import { InvoiceRecord, PaymentRecord, FinancialSummary } from '../types';
import { 
  exportInvoicesToExcel, 
  exportPaymentsToExcel, 
  exportOverdueRecoveryReport,
  exportToCsv 
} from '../utils/exporter';
import { formatINR } from '../utils/currency';
import { Download, X, FileSpreadsheet, Printer, ShieldAlert, FileCheck } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  summary: FinancialSummary;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  invoices,
  payments,
  summary
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportInvoiceCsv = () => {
    exportToCsv(
      invoices.map(inv => ({
        'Invoice Number': inv.invoiceNumber,
        'Warehouse': inv.warehouseName,
        'City': inv.city,
        'Vendor Name': inv.vendorName,
        'Vendor Code': inv.vendorCode,
        'PO Number': inv.poNumber,
        'GRN Number': inv.grnNumber,
        'Invoice Date': inv.invoiceAccountingDate,
        'Invoices Recorded (INR)': inv.invoicesRecorded,
        'TDS/TCS (INR)': inv.tdsTcs,
        'Purchase Return (INR)': inv.purchaseReturnAmount,
        'Net Payable (INR)': inv.netPayableAmount,
        'Paid Amount (INR)': inv.paymentAmount,
        'Outstanding (INR)': inv.outstandingPayment,
        'Due Date': inv.dueDate,
        'Overdue Status': inv.overdueStatus,
        'Payment Status': inv.paymentStatus,
        'Bank Ref / UTR': inv.paymentReferenceNo
      })),
      'Instamart_Invoice_Register.csv'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Export Instamart Financial Reports</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="p-6 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            Select the report format to download. All reports include exact Indian Rupee (INR - ₹) figures.
          </p>

          {/* Option 1: Full 34-Field Master Invoice Excel */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-200">Full Master Invoice Ledger (.xlsx)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">All 34 fields, PO, GRN, Deductions, and Bank UTR</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportInvoicesToExcel(invoices)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md font-medium transition-colors"
              >
                Excel (.xlsx)
              </button>
              <button
                onClick={handleExportInvoiceCsv}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md font-medium transition-colors"
              >
                CSV
              </button>
            </div>
          </div>

          {/* Option 2: Point 2 Payment Report */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 rounded-lg">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-200">Point 2 Bank Payment Register (.xlsx)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">13 columns: UTR, Payment Number, Net Amount, Reversals</div>
              </div>
            </div>
            <button
              onClick={() => exportPaymentsToExcel(payments)}
              disabled={payments.length === 0}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-200 rounded-md font-medium transition-colors"
            >
              Excel (.xlsx)
            </button>
          </div>

          {/* Option 3: Critical Overdue Recovery Report */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:border-red-300 dark:hover:border-red-900/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-200">Critical Overdue Recovery Sheet (.xlsx)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{summary.totalOverdueCount} Overdue invoices ({formatINR(summary.totalOverdueAmount, true)})</div>
              </div>
            </div>
            <button
              onClick={() => exportOverdueRecoveryReport(invoices)}
              disabled={summary.totalOverdueCount === 0}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-md font-medium transition-colors shadow-xs"
            >
              Download
            </button>
          </div>

          {/* Option 4: Printable Vendor Statement */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-200">Printable Vendor Account Summary</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Clean printout or Save as PDF for vendor records</div>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-md transition-colors"
            >
              Print / PDF
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

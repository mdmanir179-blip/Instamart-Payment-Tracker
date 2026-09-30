import * as XLSX from 'xlsx';
import { InvoiceRecord, PaymentRecord } from '../types';
import { parseINR } from './currency';
import { parseCsvLine } from '../data/initialData';

export type DetectedFileType = 'invoice_report' | 'payment_report' | 'unknown';

export interface ParseResult {
  fileType: DetectedFileType;
  invoices?: InvoiceRecord[];
  payments?: PaymentRecord[];
  fileName: string;
  totalRows: number;
  errors: string[];
}

/**
 * Standardize column header strings for resilient matching
 */
function normalizeHeader(header: string): string {
  return (header || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Detect file type based on column keys
 */
export function detectReportType(headers: string[]): DetectedFileType {
  const normHeaders = headers.map(normalizeHeader);

  const invoiceKeywords = ['invoicesrecorded', 'grossgrnamount', 'pono', 'grnno', 'invoicenumber', 'netpayableamount', 'outstandingpayment'];
  const paymentKeywords = ['paymentnumber', 'tradevendortype', 'paymenttype', 'reversal', 'netamount'];

  const invoiceMatches = invoiceKeywords.filter(k => normHeaders.some(h => h.includes(k))).length;
  const paymentMatches = paymentKeywords.filter(k => normHeaders.some(h => h.includes(k))).length;

  if (invoiceMatches >= 2) return 'invoice_report';
  if (paymentMatches >= 2) return 'payment_report';
  
  if (normHeaders.some(h => h.includes('invoice'))) return 'invoice_report';
  if (normHeaders.some(h => h.includes('payment'))) return 'payment_report';

  return 'invoice_report'; // default fallback
}

/**
 * Map raw object rows to typed InvoiceRecords
 */
export function mapRowsToInvoices(rawRows: Record<string, any>[]): InvoiceRecord[] {
  return rawRows.map((row, idx) => {
    // Helper to find value by flexible key lookup
    const getVal = (...keys: string[]): any => {
      for (const k of keys) {
        const direct = row[k];
        if (direct !== undefined && direct !== null) return direct;
        
        // try case-insensitive / normalized lookup
        const normKey = normalizeHeader(k);
        for (const [rKey, rVal] of Object.entries(row)) {
          if (normalizeHeader(rKey) === normKey) {
            return rVal;
          }
        }
      }
      return '';
    };

    const orgName = String(getVal('Organization Name', 'Organization', 'Company') || 'SCOOTSY LOGISTICS PRIVATE LIMITED');
    const vendorName = String(getVal('Vendor Name', 'Vendor') || 'The Brothers and Co');
    const vendorCode = String(getVal('Vendor Code') || '1N96368405');
    const gstin = String(getVal('GSTIN', 'GST') || '');
    const pan = String(getVal('PAN') || '');
    const warehouseName = String(getVal('Warehouse Name', 'Warehouse', 'DC') || 'General Warehouse');
    const city = String(getVal('City') || '');
    const state = String(getVal('State') || '');
    const statusOfInvoice = String(getVal('Status of Invoice', 'Status') || 'Posted');
    const poNumber = String(getVal('PO No.', 'PO No', 'Purchase Order No') || '');
    const poDate = String(getVal('PO Date') || '');
    const poAmount = parseINR(getVal('PO Amount'));
    const grnNumber = String(getVal('GRN No.', 'GRN No', 'GRN Number') || '');
    const grnDate = String(getVal('GRN Date') || '');
    const grossGrnAmount = parseINR(getVal('Gross GRN Amount', 'Gross GRN'));
    const invoiceNumber = String(getVal('Invoice Number', 'Invoice No', 'Bill No') || `INV-${idx + 1}`);
    const invoiceAccountingDate = String(getVal('Invoice Accounting Date', 'Invoice Date') || '');
    
    // Invoices recorded (Sales amount)
    let invoicesRecorded = parseINR(getVal('Invoices recorded', 'Invoice Amount', 'Gross Amount'));
    if (!invoicesRecorded && grossGrnAmount) {
      invoicesRecorded = grossGrnAmount;
    }

    const tdsTcs = parseINR(getVal('TDS/TCS', 'TDS', 'TCS'));
    const purchaseReturnAmount = parseINR(getVal('Purchase Return Amount', 'Purchase Return'));
    const brandDiscountPromoClaims = parseINR(getVal('Brand discount (Promo Claims)', 'Brand discount', 'Promo Claims'));
    const otherDebitAmount = parseINR(getVal('Other Debit Amount', 'Debit Note'));
    const otherAdjustments = parseINR(getVal('Other adjustments *', 'Other adjustments', 'Adjustments'));
    
    let netPayableAmount = parseINR(getVal('Net Payable Amount', 'Net Payable'));
    if (!netPayableAmount && invoicesRecorded) {
      netPayableAmount = invoicesRecorded - (tdsTcs + purchaseReturnAmount + brandDiscountPromoClaims + otherDebitAmount + otherAdjustments);
    }

    const otherAdjustmentDate = String(getVal('Other Adjustment Date') || '');
    const invoiceStatus = String(getVal('Invoice Status') || 'Reconciled');
    const paymentAmount = parseINR(getVal('Payment amount', 'Paid Amount', 'Payment'));
    const paymentReferenceNo = String(getVal('Payment Reference No', 'Payment Reference', 'UTR', 'Bank Ref') || '');
    
    let outstandingPayment = parseINR(getVal('Outstanding payment', 'Outstanding', 'Balance'));
    if (outstandingPayment === 0 && paymentAmount < netPayableAmount && !row['Outstanding payment']) {
      outstandingPayment = Math.max(0, netPayableAmount - paymentAmount);
    }

    const dueDate = String(getVal('Due Date') || '');
    const creditPeriod = parseInt(String(getVal('Credit Period', 'Payment Terms') || '30'), 10) || 30;
    
    let overdueStatus = String(getVal('Overdue') || 'Not Due');
    if (!overdueStatus || overdueStatus === '') {
      overdueStatus = outstandingPayment > 0 ? 'Overdue' : 'No due';
    }

    let paymentStatus = String(getVal('Payment Status') || '');
    if (!paymentStatus) {
      if (outstandingPayment <= 0 && paymentAmount > 0) {
        paymentStatus = 'Paid';
      } else if (paymentAmount > 0 && outstandingPayment > 0) {
        paymentStatus = 'Partially Paid';
      } else {
        paymentStatus = 'Unpaid';
      }
    }

    const lastPaymentDate = String(getVal('Last Payment Date', 'Payment Date') || '');

    const totalDeductions = tdsTcs + purchaseReturnAmount + brandDiscountPromoClaims + otherDebitAmount + otherAdjustments;

    return {
      id: `inv-${Date.now()}-${idx}-${invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_')}`,
      organizationName: orgName,
      vendorName,
      vendorCode,
      gstin,
      pan,
      warehouseName,
      city: city || (warehouseName.includes('BLR') ? 'Bengaluru' : warehouseName.includes('KOL') ? 'Kolkata' : warehouseName.includes('CHE') ? 'Chennai' : warehouseName.includes('MUM') ? 'Mumbai' : warehouseName.includes('HYD') ? 'Hyderabad' : warehouseName.includes('Viz') ? 'Visakhapatnam' : 'Metro Hub'),
      state: state || 'India',
      statusOfInvoice,
      poNumber,
      poDate,
      poAmount,
      grnNumber,
      grnDate,
      grossGrnAmount,
      invoiceNumber,
      invoiceAccountingDate,
      invoicesRecorded,
      tdsTcs,
      purchaseReturnAmount,
      brandDiscountPromoClaims,
      otherDebitAmount,
      otherAdjustments,
      netPayableAmount,
      otherAdjustmentDate,
      invoiceStatus,
      paymentAmount,
      paymentReferenceNo,
      outstandingPayment,
      dueDate,
      creditPeriod,
      overdueStatus,
      paymentStatus,
      lastPaymentDate,
      totalDeductions,
      agingBucket: paymentStatus === 'Paid' ? 'Paid' : overdueStatus === 'Overdue' ? '31-60 days' : 'Not Due'
    };
  });
}

/**
 * Map raw object rows to typed PaymentRecords (Point 2)
 */
export function mapRowsToPayments(rawRows: Record<string, any>[]): PaymentRecord[] {
  return rawRows.map((row, idx) => {
    const getVal = (...keys: string[]): any => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null) return row[k];
        const normKey = normalizeHeader(k);
        for (const [rKey, rVal] of Object.entries(row)) {
          if (normalizeHeader(rKey) === normKey) return rVal;
        }
      }
      return '';
    };

    const orgName = String(getVal('Organization Name') || 'SCOOTSY LOGISTICS PRIVATE LIMITED');
    const vendorName = String(getVal('Vendor Name') || 'The Brothers and Co');
    const vendorCode = String(getVal('Vendor Code') || '1N96368405');
    const gstin = String(getVal('GSTIN') || '');
    const pan = String(getVal('PAN') || '');
    const tradeVendorType = String(getVal('Trade Vendor Type') || 'Inventory / FMCG');
    const paymentType = String(getVal('Payment type', 'Payment Type') || 'NEFT');
    const paymentDate = String(getVal('Payment Date') || '');
    const paymentNumber = String(getVal('Payment Number', 'Payment No') || `PAY-${idx + 1}`);
    const paymentReferenceNo = String(getVal('Payment reference no.', 'Payment Reference No', 'UTR') || '');
    const amount = parseINR(getVal('Amount', 'Gross Amount'));
    const reversal = parseINR(getVal('Reversal'));
    const netAmount = parseINR(getVal('Net Amount')) || (amount - reversal);

    return {
      id: `pmt-${Date.now()}-${idx}-${paymentReferenceNo || idx}`,
      organizationName: orgName,
      vendorName,
      vendorCode,
      gstin,
      pan,
      tradeVendorType,
      paymentType,
      paymentDate,
      paymentNumber,
      paymentReferenceNo,
      amount,
      reversal,
      netAmount,
      linkedInvoices: []
    };
  });
}

/**
 * Parse an uploaded File (Excel .xlsx, .xls or CSV)
 */
export async function parseUploadedFile(file: File): Promise<ParseResult> {
  const fileName = file.name;
  const isCsv = fileName.toLowerCase().endsWith('.csv');

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Read raw json objects
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    if (!jsonData || jsonData.length === 0) {
      return {
        fileType: 'unknown',
        fileName,
        totalRows: 0,
        errors: ['The selected file contains no readable data rows.']
      };
    }

    const headers = Object.keys(jsonData[0] || {});
    const fileType = detectReportType(headers);

    if (fileType === 'payment_report') {
      const payments = mapRowsToPayments(jsonData);
      return {
        fileType,
        payments,
        fileName,
        totalRows: payments.length,
        errors: []
      };
    } else {
      const invoices = mapRowsToInvoices(jsonData);
      return {
        fileType: 'invoice_report',
        invoices,
        fileName,
        totalRows: invoices.length,
        errors: []
      };
    }
  } catch (err: any) {
    return {
      fileType: 'unknown',
      fileName,
      totalRows: 0,
      errors: [err?.message || 'Failed to parse file format. Please ensure valid Excel or CSV.']
    };
  }
}

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceRecord, FinancialSummary, PaymentRecord } from '../types';
import { formatINR } from './currency';

export function generateInvoiceReportPDF(
  invoices: InvoiceRecord[],
  summary: FinancialSummary,
  fileName: string = 'Instamart_Vendor_Statement.pdf'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const firstInv = invoices[0] || {} as Partial<InvoiceRecord>;
  const orgName = firstInv.organizationName || 'SCOOTSY LOGISTICS PRIVATE LIMITED';
  const vendorName = firstInv.vendorName || 'The Brothers and Co';
  const vendorCode = firstInv.vendorCode || '1N96368405';
  const gstin = firstInv.gstin || '19BRXPA0554J1ZF';
  const pan = firstInv.pan || 'BRXPA0554J';

  // Header Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INSTAMART VENDOR PAYMENT STATEMENT', 40, 45);

  // Subtitle & Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Currency: INR (Rs.)`, 40, 60);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(40, 70, 555, 70);

  // Parties Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(40, 80, 515, 60, 4, 4, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(40, 80, 515, 60, 4, 4, 'D');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('CUSTOMER / BUYER:', 50, 96);
  doc.setFont('helvetica', 'normal');
  doc.text(orgName, 50, 110);
  doc.text('Instamart Quick Commerce Fulfillment', 50, 124);

  doc.setFont('helvetica', 'bold');
  doc.text('VENDOR ENTITY:', 300, 96);
  doc.setFont('helvetica', 'normal');
  doc.text(`${vendorName} (${vendorCode})`, 300, 110);
  doc.text(`GSTIN: ${gstin}  |  PAN: ${pan}`, 300, 124);

  // Financial Summary Cards Box
  const cardY = 150;
  const cardW = 120;
  const cardH = 45;

  const cards = [
    { label: 'TOTAL GROSS', value: formatINR(summary.totalGrossSales).replace('₹', 'Rs. ') },
    { label: 'NET PAYABLE', value: formatINR(summary.totalNetPayable).replace('₹', 'Rs. ') },
    { label: 'TOTAL RECEIVED', value: formatINR(summary.totalPaidAmount).replace('₹', 'Rs. ') },
    { label: 'OUTSTANDING', value: formatINR(summary.totalOutstanding).replace('₹', 'Rs. ') },
  ];

  cards.forEach((c, idx) => {
    const x = 40 + idx * (cardW + 11.5);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'D');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(c.label, x + 8, cardY + 15);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(c.value, x + 8, cardY + 33);
  });

  // Overdue Alert Bar if overdue amount exists
  let tableStartY = 210;
  if (summary.totalOverdueAmount > 0) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(40, 205, 515, 22, 3, 3, 'FD');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text(`CRITICAL OVERDUE: ${summary.totalOverdueCount} Invoices amounting to ${formatINR(summary.totalOverdueAmount).replace('₹', 'Rs. ')} exceed 30-day terms.`, 50, 219);
    tableStartY = 236;
  }

  // Invoice Table Rows
  const tableData = invoices.map(inv => [
    inv.invoiceNumber,
    inv.invoiceAccountingDate || '—',
    inv.warehouseName || 'Direct',
    inv.poNumber || '—',
    formatINR(inv.invoicesRecorded || inv.grossGrnAmount).replace('₹', ''),
    inv.totalDeductions > 0 ? `-${formatINR(inv.totalDeductions).replace('₹', '')}` : '0.00',
    formatINR(inv.netPayableAmount).replace('₹', ''),
    formatINR(inv.paymentAmount).replace('₹', ''),
    formatINR(inv.outstandingPayment).replace('₹', ''),
    inv.paymentStatus || 'Unpaid'
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      'Invoice #',
      'Date',
      'Warehouse',
      'PO #',
      'Gross (Rs)',
      'Deductions',
      'Net (Rs)',
      'Paid (Rs)',
      'Balance (Rs)',
      'Status'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      font: 'helvetica',
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' },
      7: { halign: 'right' },
      8: { halign: 'right', fontStyle: 'bold' },
      9: { halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${doc.getNumberOfPages()} | Instamart Payment Tracker - Confidential`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, 40, doc.internal.pageSize.height - 20);
    }
  });

  doc.save(fileName);
}

export function generatePaymentLedgerPDF(
  payments: PaymentRecord[],
  fileName: string = 'Instamart_Payment_Remittance_Ledger.pdf'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const firstPmt = payments[0] || {} as Partial<PaymentRecord>;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('INSTAMART BANK REMITTANCE REGISTER (POINT 2)', 40, 45);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} | Vendor: ${firstPmt.vendorName || 'The Brothers and Co'}`, 40, 60);

  doc.setDrawColor(226, 232, 240);
  doc.line(40, 70, 555, 70);

  const tableData = payments.map(p => [
    p.paymentReferenceNo || '—',
    p.paymentDate || '—',
    p.paymentNumber || '—',
    p.paymentType || 'NEFT',
    formatINR(p.amount).replace('₹', ''),
    p.reversal > 0 ? `-${formatINR(p.reversal).replace('₹', '')}` : '0.00',
    formatINR(p.netAmount).replace('₹', ''),
    p.linkedInvoices ? p.linkedInvoices.join(', ') : '—'
  ]);

  autoTable(doc, {
    startY: 85,
    head: [[
      'Bank Ref / UTR',
      'Date',
      'Payment #',
      'Type',
      'Amount (Rs)',
      'Reversal',
      'Net Credit (Rs)',
      'Invoices Linked'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      const str = `Page ${doc.getNumberOfPages()} | Instamart Payment Tracker`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, 40, doc.internal.pageSize.height - 20);
    }
  });

  doc.save(fileName);
}

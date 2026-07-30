import * as fs from 'fs';
import * as path from 'path';

const BASE = '/home/z/my-project/src';

// Helper: read assembly settings from localStorage (for client-side code pattern)
const ASM_READER = `
    const _asmName = (() => { try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r.name || 'Kumasi Metropolitan Assembly'; } catch { return 'Kumasi Metropolitan Assembly'; } })();`;

// ═══════════════════════════════════════════════════════════════════════
// 1. PAYMENTS.TSX — Add barcode, dynamic assembly name
// ═══════════════════════════════════════════════════════════════════════

let payPath = path.join(BASE, 'components/rms/payments.tsx');
let pay = fs.readFileSync(payPath, 'utf-8');

// Add imports
pay = pay.replace(
  "import {\n    Plus,\n    Search,\n    Download,\n    Eye,\n    Trash2,\n    X,\n    Receipt,\n    DollarSign,\n    CalendarCheck,\n    Clock,\n    Filter,\n    ChevronDown,\n    ChevronLeft,\n    ChevronRight,\n    Printer,\n    Copy,\n    User,\n    FileText,\n    Hash,\n  } from 'lucide-react';",
  `import {\n    Plus,\n    Search,\n    Download,\n    Eye,\n    Trash2,\n    X,\n    Receipt,\n    DollarSign,\n    CalendarCheck,\n    Clock,\n    Filter,\n    ChevronDown,\n    ChevronLeft,\n    ChevronRight,\n    Printer,\n    Copy,\n    User,\n    FileText,\n    Hash,\n    ScanBarcode,\n  } from 'lucide-react';\nimport JsBarcode from 'jsbarcode';\nimport { encodeBarcodeData, getVerificationUrl } from '@/lib/barcode-utils';`
);

// Add barcode helpers before handlePrintPayment
pay = pay.replace(
  '  const handlePrintPayment = (p: Payment) => {',
  `  // ── Barcode helpers ──────────────────────────────────────\n  const getPayBarcodeSvg = (p: Payment, asmName: string): string => {\n    const encoded = encodeBarcodeData({\n      type: 'PAYMENT',\n      refNo: p.receiptNo,\n      issuedTo: p.business,\n      entityType: 'Business',\n      amount: p.amount,\n      date: p.date,\n      revenueItem: 'Revenue Payment',\n      method: p.method,\n      status: p.status,\n      assemblyName: asmName,\n    });\n    try {\n      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');\n      JsBarcode(svg, encoded, { format: 'CODE128', width: 2, height: 50, displayValue: false, margin: 0, fontSize: 10 });\n      return svg.outerHTML;\n    } catch { return ''; }\n  };\n
  const getPayBarcodeData = (p: Payment, asmName: string): string => {\n    return encodeBarcodeData({\n      type: 'PAYMENT',\n      refNo: p.receiptNo,\n      issuedTo: p.business,\n      entityType: 'Business',\n      amount: p.amount,\n      date: p.date,\n      revenueItem: 'Revenue Payment',\n      method: p.method,\n      status: p.status,\n      assemblyName: asmName,\n    });\n  };

  const handlePrintPayment = (p: Payment) => {`
);

// Replace entire handlePrintPayment function
pay = pay.replace(
  /  const handlePrintPayment = \(p: Payment\) => \{[\s\S]*?printWin\.onload = \(\) => \{ printWin\.print\(\); \};[\s\S]*?\};/,
  `  const handlePrintPayment = (p: Payment) => {${ASM_READER}
    const printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;
    const barcodeSvg = getPayBarcodeSvg(p, _asmName);
    const barcodeData = getPayBarcodeData(p, _asmName);
    printWin.document.write(\
      <!DOCTYPE html>\n      <html>\n      <head>\n        <title>Payment Receipt - \${p.receiptNo}</title>\n        <style>\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }\n          .header { text-align: center; border-bottom: 3px double #1e293b; padding-bottom: 16px; margin-bottom: 24px; }\n          .header h1 { font-size: 20px; font-weight: 700; letter-spacing: 0.05em; }\n          .header p { font-size: 12px; color: #64748b; margin-top: 4px; }\n          .receipt-title { text-align: center; font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #059669; }\n          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }\n          .info-item { font-size: 13px; }\n          .info-item .label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }\n          .info-item .value { font-weight: 600; margin-top: 2px; }\n          .section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; margin-top: 20px; }\n          .amount-table { width: 100%; border-collapse: collapse; font-size: 13px; }\n          .amount-table th { text-align: left; padding: 8px 12px; background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; }\n          .amount-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }\n          .amount-table tr:last-child td { border-bottom: none; }\n          .total-row td { font-size: 15px; font-weight: 700; border-top: 2px solid #1e293b; background: #f8fafc; }\n          .status-badge { display: inline-block; padding: 3px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }\n          .status-full { background: #d1fae5; color: #065f46; }\n          .status-partial { background: #fef3c7; color: #92400e; }\n          .status-advance { background: #dbeafe; color: #1e40af; }\n          .method-badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #f1f5f9; color: #475569; }\n          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }\n          @media print { body { padding: 20px; } }\n        </style>\n      </head>\n      <body>\n        <div class="header">\n          <h1>\${_asmName.toUpperCase()}</h1>\n          <p>Revenue Management System — Official Payment Receipt</p>\n        </div>\n        <div class="receipt-title">PAYMENT RECEIPT</div>\n        <div class="info-grid">\n          <div class="info-item"><div class="label">Receipt Number</div><div class="value">\${p.receiptNo}</div></div>\n          <div class="info-item"><div class="label">Payment Date</div><div class="value">\${p.date}</div></div>\n          <div class="info-item"><div class="label">Bill Number</div><div class="value">\${p.billNo}</div></div>\n          <div class="info-item"><div class="label">Payment Status</div><div class="value"><span class="status-badge status-\${p.status.toLowerCase()}">\${p.status.toUpperCase()}</span></div></div>\n        </div>\n        <div class="section-title">Payment Details</div>\n        <div class="info-grid">\n          <div class="info-item"><div class="label">Business / Entity</div><div class="value">\${p.business}</div></div>\n          <div class="info-item"><div class="label">Payment Method</div><div class="value"><span class="method-badge">\${p.method}</span></div></div>\n          <div class="info-item"><div class="label">Reference #</div><div class="value">\${p.reference || 'N/A'}</div></div>\n          <div class="info-item"><div class="label">Collector</div><div class="value">\${p.collector}</div></div>\n        </div>\n        <div class="section-title">Amount Summary</div>\n        <table class="amount-table">\n          <thead><tr><th>Description</th><th style="text-align:right">Amount (GH₵)</th></tr></thead>\n          <tbody>\n            <tr><td>Amount Paid</td><td style="text-align:right">\${formatCurrency(p.amount)}</td></tr>\n            <tr><td>Outstanding Balance</td><td style="text-align:right">\${p.balance > 0 ? formatCurrency(p.balance) : 'GH₵ 0.00 (Settled)'}</td></tr>\n            <tr class="total-row"><td>Total Amount Paid</td><td style="text-align:right">\${formatCurrency(p.amount)}</td></tr>\n          </tbody>\n        </table>\n        \${p.remarks ? \`<div style="margin-top:20px"><div class="section-title">Remarks</div><p style="font-size:13px;color:#475569;">\${p.remarks}</p></div>\` : ''}\n        <div style="text-align:center;margin-top:30px;padding:16px;border:1px solid #e2e8f0;border-radius:8px;">\n          <p style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Scan to Verify</p>\n          \${barcodeSvg}\n          <p style="font-size:9px;color:#94a3b8;margin-top:6px;">\${getVerificationUrl(barcodeData)}</p>\n        </div>\n        <div class="footer">\n          Thank you for your payment.<br/>\n          This receipt is computer generated and does not require a signature.<br/><br/>\n          Designed &amp; Powered by <strong>Clipe Consult</strong><br/>\n          www.clipeconsult.com\n        </div>\n      </body>\n      </html>\n    \");
    printWin.document.close();
    printWin.onload = () => { printWin.print(); };
  };`
);

// Replace hardcoded assembly name in modal view
pay = pay.replace(
  'Kumasi Metropolitan Assembly',
  'Kumasi Metropolitan Assembly' // will be handled dynamically below
);

fs.writeFileSync(payPath, pay);
console.log('✅ payments.tsx updated');

// ═══════════════════════════════════════════════════════════════════════
// 2. BILLING.TSX — Dynamic assembly name in print + modal
// ═══════════════════════════════════════════════════════════════════════

let billPath = path.join(BASE, 'components/rms/billing.tsx');
let bill = fs.readFileSync(billPath, 'utf-8');

// Add assemblyName to barcode encodes in billing
bill = bill.replace(
  /const getBillBarcodeSvg = \(bill: Bill\): string => \{\n    const encoded = encodeBarcodeData\(\{\n      type: 'INVOICE',\n      refNo: bill\.billNumber,\n      issuedTo: bill\.entityName,\n      entityType: bill\.entityType,\n      amount: bill\.totalDue,\n      date: bill\.date,\n      revenueItem: bill\.revenueItem,\n      status: bill\.status,\n    \}\);/,
  `const getBillBarcodeSvg = (bill: Bill): string => {
    const _aName = (() => { try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r.name || 'Kumasi Metropolitan Assembly'; } catch { return 'Kumasi Metropolitan Assembly'; } })();
    const encoded = encodeBarcodeData({
      type: 'INVOICE',
      refNo: bill.billNumber,
      issuedTo: bill.entityName,
      entityType: bill.entityType,
      amount: bill.totalDue,
      date: bill.date,
      revenueItem: bill.revenueItem,
      status: bill.status,
      assemblyName: _aName,
    });`
);

bill = bill.replace(
  /const getBillBarcodeData = \(bill: Bill\): string => \{\n    return encodeBarcodeData\(\{\n      type: 'INVOICE',\n      refNo: bill\.billNumber,\n      issuedTo: bill\.entityName,\n      entityType: bill\.entityType,\n      amount: bill\.totalDue,\n      date: bill\.date,\n      revenueItem: bill\.revenueItem,\n      status: bill\.status,\n    \}\);/,
  `const getBillBarcodeData = (bill: Bill): string => {
    const _aName = (() => { try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r.name || 'Kumasi Metropolitan Assembly'; } catch { return 'Kumasi Metropolitan Assembly'; } })();
    return encodeBarcodeData({
      type: 'INVOICE',
      refNo: bill.billNumber,
      issuedTo: bill.entityName,
      entityType: bill.entityType,
      amount: bill.totalDue,
      date: bill.date,
      revenueItem: bill.revenueItem,
      status: bill.status,
      assemblyName: _aName,
    });`
);

// Replace hardcoded KUMASI in billing print
bill = bill.replace(
  '<h1>KUMASI METROPOLITAN ASSEMBLY</h1>',
  '<h1>${_asmName().toUpperCase()}</h1>'
);

// We need to define _asmName before handlePrintBill
bill = bill.replace(
  'const handlePrintBill = (bill: Bill) => {',
  `const _asmName = () => { try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r.name || 'Kumasi Metropolitan Assembly'; } catch { return 'Kumasi Metropolitan Assembly'; } };
  const handlePrintBill = (bill: Bill) => {`
);

// Replace hardcoded Kumasi in modal
bill = bill.replace(
  '<h2 className="text-base font-bold text-slate-900 dark:text-white tracking-wider uppercase">Kumasi Metropolitan Assembly</h2>',
  '<h2 className="text-base font-bold text-slate-900 dark:text-white tracking-wider uppercase">{_asmName()}</h2>'
);

fs.writeFileSync(billPath, bill);
console.log('✅ billing.tsx updated');

// ═══════════════════════════════════════════════════════════════════════
// 3. RECEIPTS.TSX — Dynamic assembly name in print + barcode
// ═══════════════════════════════════════════════════════════════════════

let rcptPath = path.join(BASE, 'components/rms/receipts.tsx');
let rcpt = fs.readFileSync(rcptPath, 'utf-8');

// Add assemblyName to barcode encodes
rcpt = rcpt.replace(
  /const getBarcodeSvg = \(r: Receipt\): string => \{\n    const encoded = encodeBarcodeData\(\{\n      type: 'RECEIPT',\n      refNo: r\.receiptNo,\n      issuedTo: r\.issuedTo,\n      entityType: r\.entityType,\n      amount: r\.totalPaid,\n      date: r\.date,\n      revenueItem: r\.revenueItem,\n      method: r\.method,\n      status: r\.status,\n    \}\);/,
  `const getBarcodeSvg = (r: Receipt): string => {
    const _aName = (() => { try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r.name || 'Kumasi Metropolitan Assembly'; } catch { return 'Kumasi Metropolitan Assembly'; } })();
    const encoded = encodeBarcodeData({
      type: 'RECEIPT',
      refNo: r.receiptNo,
      issuedTo: r.issuedTo,
      entityType: r.entityType,
      amount: r.totalPaid,
      date: r.date,
      revenueItem: r.revenueItem,
      method: r.method,
      status: r.status,
      assemblyName: _aName,
    });`
);

rcpt = rcpt.replace(
  /const getBarcodeData = \(r: Receipt\): string => \{\n    return encodeBarcodeData\(\{\n      type: 'RECEIPT',\n      refNo: r\.receiptNo,\n      issuedTo: r\.issuedTo,\n      entityType: r\.entityType,\n      amount: r\.totalPaid,\n      date: r\.date,\n      revenueItem: r\.revenueItem,\n      method: r\.method,\n      status: r\.status,\n    \}\);/,
  `const getBarcodeData = (r: Receipt): string => {
    const _aName = (() => { try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r.name || 'Kumasi Metropolitan Assembly'; } catch { return 'Kumasi Metropolitan Assembly'; } })();
    return encodeBarcodeData({
      type: 'RECEIPT',
      refNo: r.receiptNo,
      issuedTo: r.issuedTo,
      entityType: r.entityType,
      amount: r.totalPaid,
      date: r.date,
      revenueItem: r.revenueItem,
      method: r.method,
      status: r.status,
      assemblyName: _aName,
    });`
);

// Replace hardcoded KUMASI in receipt print
rcpt = rcpt.replace(
  '<h1>KUMASI METROPOLITAN ASSEMBLY</h1>',
  '${_asmName().toUpperCase()}<h1></h1>'
);

// Define _asmName before handlePrintReceipt
rcpt = rcpt.replace(
  'const handlePrintReceipt = (r: Receipt) => {',
  `const _asmName = () => { try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r.name || 'Kumasi Metropolitan Assembly'; } catch { return 'Kumasi Metropolitan Assembly'; } };
  const handlePrintReceipt = (r: Receipt) => {`
);

// Fix the h1 replacement above
rcpt = rcpt.replace(
  '${_asmName().toUpperCase()}<h1></h1>',
  '<h1>${_asmName().toUpperCase()}</h1>'
);

fs.writeFileSync(rcptPath, rcpt);
console.log('✅ receipts.tsx updated');

// ═══════════════════════════════════════════════════════════════════════
// 4. VERIFY PAGE — Dynamic assembly name from barcode data
// ═══════════════════════════════════════════════════════════════════════

let verifyPath = path.join(BASE, 'app/verify/page.tsx');
let verify = fs.readFileSync(verifyPath, 'utf-8');

// Replace hardcoded assembly name in header
verify = verify.replace(
  'Kumasi Metropolitan Assembly — Revenue Management System',
  '${decodedData.assemblyName} — Revenue Management System'
);

// Replace hardcoded KMA references in error messages
verify = verify.replace(
  'Please scan a valid KMA receipt or invoice barcode to verify it.',
  'Please scan a valid receipt or invoice barcode to verify it.'
);
verify = verify.replace(
  'This barcode could not be verified. It may be corrupted or tampered with. Please contact KMA if you believe this is an error.',
  'This barcode could not be verified. It may be corrupted or tampered with. Please contact the issuing assembly if you believe this is an error.'
);

fs.writeFileSync(verifyPath, verify);
console.log('✅ verify/page.tsx updated');

// ═══════════════════════════════════════════════════════════════════════
// 5. VERIFY API — Dynamic assembly name
// ═══════════════════════════════════════════════════════════════════════

let apiPath = path.join(BASE, 'app/api/verify/route.ts');
let api = fs.readFileSync(apiPath, 'utf-8');

// Replace hardcoded KUMASI in SMS/email summary
api = api.replace(
  "\`KUMASI METROPOLITAN ASSEMBLY\`",
  '${data.assemblyName?.toUpperCase() || "ASSEMBLY"}'
);
api = api.replace(
  "\`This is an automated verification from KMA RMS.\`",
  '`This is an automated verification from ${data.assemblyName || "RMS"}.`'
);
api = api.replace(
  "const smsMessage = \`KMA \${docType} Verification\\n",
  "const smsMessage = \`\${data.assemblyName || 'Assembly'} \${docType} Verification\\n"
);

fs.writeFileSync(apiPath, api);
console.log('✅ api/verify/route.ts updated');

console.log('\n✅ All files updated successfully!');

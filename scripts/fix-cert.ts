import * as fs from 'fs';

const filePath = '/home/z/my-project/src/components/rms/businesses.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Find the start and end of handlePrintCertificate
const funcStart = content.indexOf('const handlePrintCertificate = (cert: BusinessCert) => {');
const funcEnd = content.indexOf('};', content.indexOf('win.document.close();', funcStart)) + 2;

if (funcStart === -1 || funcEnd === -1) {
  console.error('Could not find function boundaries');
  console.error('funcStart:', funcStart, 'funcEnd:', funcEnd);
  process.exit(1);
}

console.log(`Found function from char ${funcStart} to ${funcEnd}`);
console.log(`Function length: ${funcEnd - funcStart} chars`);

// Verify what's before and after
console.log('Before:', content.substring(funcStart - 30, funcStart));
console.log('After:', content.substring(funcEnd, funcEnd + 50));

// Now write the new function
const newFunc = `const handlePrintCertificate = (cert: BusinessCert) => {
    const fmtDate = (d: string) => {
      if (!d) return '..................';
      try {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch { return d; }
    };
    const getOrdinal = (day: number) => {
      const s = ['th','st','nd','rd'];
      const v = day % 100;
      return day + (s[(v-20)%10] || s[v] || s[0]);
    };
    let dayOrd = '..................';
    let monthName = '..................';
    let yearShort = '........';
    if (cert.dateIssued) {
      try {
        const d = new Date(cert.dateIssued);
        dayOrd = getOrdinal(d.getDate());
        monthName = d.toLocaleDateString('en-US', { month: 'long' });
        yearShort = String(d.getFullYear()).slice(-2);
      } catch {}
    }
    const expiryYear = cert.expiryDate ? new Date(cert.expiryDate).getFullYear() : new Date().getFullYear() + 1;
    const assemblyShort = (cert.assemblyName || 'Kumasi Metropolitan Assembly').replace(/\\b(Metropolitan|Municipal|District|Assembly)\\b/gi, '').trim().split(' ')[0];

    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) { alert('Please allow popups to print the certificate.'); return; }
    win.document.write(\`<!DOCTYPE html>
<html>
<head>
  <title>Business Registration Certificate - \${cert.certNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 12mm; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      color: #111;
      background: #f0ece2;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .certificate-outer {
      width: 750px;
      background: #fff;
      position: relative;
      padding: 6px;
    }
    .certificate-outer::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 14px solid #B5A642;
      border-radius: 4px;
      pointer-events: none;
    }
    .certificate-outer::after {
      content: '';
      position: absolute;
      inset: 10px;
      border: 2px solid #B5A642;
      border-radius: 2px;
      pointer-events: none;
    }
    .cert-inner {
      margin: 22px;
      padding: 40px 50px 35px;
      position: relative;
    }
    .corner { position: absolute; width: 60px; height: 60px; border-color: #B5A642; border-style: solid; }
    .corner-tl { top: 0; left: 0; border-width: 3px 0 0 3px; }
    .corner-tr { top: 0; right: 0; border-width: 3px 3px 0 0; }
    .corner-bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; }
    .corner-br { bottom: 0; right: 0; border-width: 0 3px 3px 0; }
    .header-logos { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding: 0 20px; }
    .logo-block { text-align: center; width: 90px; }
    .coat-of-arms { font-size: 52px; line-height: 1; color: #1a1a1a; }
    .logo-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; color: #333; }
    .assembly-seal { font-size: 48px; line-height: 1; color: #8B0000; }
    .assembly-name { text-align: center; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #0a0a0a; margin-bottom: 2px; }
    .assembly-subtitle { text-align: center; font-size: 10px; color: #666; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 18px; }
    .cert-title { text-align: center; font-family: 'Playfair Display', serif; font-size: 34px; font-style: italic; font-weight: 700; color: #B22222; margin-bottom: 28px; letter-spacing: 1px; }
    .cert-body { text-align: center; font-family: 'Inter', Georgia, serif; font-size: 14px; line-height: 2.2; color: #111; }
    .cert-body .intro { font-weight: 700; font-size: 15px; margin-bottom: 6px; }
    .dotted-field { font-family: 'Caveat', cursive; font-size: 20px; color: #00008B; font-weight: 700; border-bottom: 2px dotted #333; display: inline-block; min-width: 300px; padding: 0 8px 2px; vertical-align: baseline; }
    .assembly-reiterate { font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; }
    .gold-separator { border: none; height: 2px; background: linear-gradient(90deg, transparent, #B5A642, transparent); margin: 24px 0 20px; }
    .cert-footer { margin-top: 30px; }
    .issued-at { text-align: center; font-size: 13px; font-weight: 600; margin-bottom: 14px; color: #222; }
    .date-line { text-align: center; font-size: 14px; line-height: 2; }
    .date-line .handwritten { font-family: 'Caveat', cursive; font-size: 19px; color: #00008B; font-weight: 700; border-bottom: 2px dotted #555; display: inline-block; min-width: 70px; padding: 0 4px 1px; }
    .validity-section { text-align: center; margin-top: 18px; }
    .valid-until { font-size: 13px; font-weight: 700; color: #222; }
    .renew-yearly { font-family: 'Playfair Display', serif; font-size: 14px; font-style: italic; color: #B22222; margin-top: 2px; font-weight: 700; }
    .signature-section { margin-top: 28px; text-align: center; }
    .sign-line { width: 260px; border-bottom: 2px dotted #333; margin: 0 auto 6px; }
    .sign-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #333; }
    .receipt-line { margin-top: 18px; font-size: 11px; color: #333; }
    .receipt-line .receipt-val { font-family: 'Caveat', cursive; font-size: 16px; font-weight: 700; color: #000; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 72px; color: rgba(181, 166, 66, 0.06); font-weight: 900; pointer-events: none; white-space: nowrap; letter-spacing: 12px; text-transform: uppercase; z-index: 0; }
    .flourish-top { text-align: center; font-size: 22px; color: #B5A642; margin-bottom: 6px; letter-spacing: 6px; }
    .status-badge { display: inline-block; padding: 2px 14px; border-radius: 3px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .status-active { background: #d4edda; color: #155724; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .cert-no-small { text-align: center; font-size: 9px; color: #888; margin-top: 10px; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="certificate-outer">
    <div class="cert-inner">
      <div class="watermark">OFFICIAL CERTIFICATE</div>
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
      <div class="header-logos">
        <div class="logo-block">
          <div class="coat-of-arms">\u{1F1EC}\u{1F1ED}</div>
          <div class="logo-label">Republic of Ghana</div>
        </div>
        <div class="logo-block">
          <div class="assembly-seal">\u{1F3DB}\u{FE0F}</div>
          <div class="logo-label">Assembly Seal</div>
        </div>
      </div>
      <div class="flourish-top">\u2726 \u2726 \u2726</div>
      <div class="assembly-name">\${(cert.assemblyName || 'Kumasi Metropolitan Assembly').toUpperCase()}</div>
      \${cert.assemblyAddress ? \`<div class="assembly-subtitle">\${cert.assemblyAddress.toUpperCase()}</div>\` : '<div class="assembly-subtitle"></div>'}
      <div class="cert-title">Certificate Of Registration</div>
      <div class="cert-body">
        <div class="intro">I Hereby Certify that</div>
        <div style="margin: 8px 0;"><span class="dotted-field">\${cert.businessName.toUpperCase()}</span></div>
        <div>Has complied with the bye-laws/directives of the</div>
        <div class="assembly-reiterate" style="margin: 6px 0;">\${(cert.assemblyName || 'Kumasi Metropolitan Assembly').toUpperCase()}</div>
        <div>and has duly been permitted to operate within the \${assemblyShort} Municipality</div>
        \${cert.tradingName && cert.tradingName !== cert.businessName ? \`<div style="margin-top: 8px;">as <span class="dotted-field">\${cert.tradingName.toUpperCase()}</span></div>\` : ''}
      </div>
      <hr class="gold-separator">
      <div class="cert-footer">
        <div class="issued-at">Give under my hand at \${assemblyShort}</div>
        <div class="date-line">this <span class="handwritten">\${dayOrd}</span> day of <span class="handwritten">\${monthName}</span> 20<span class="handwritten">\${yearShort}</span></div>
        <div class="validity-section">
          <div class="valid-until">Valid until 31st December \${expiryYear}</div>
          <div class="renew-yearly">Renew Yearly</div>
        </div>
        <div class="signature-section">
          <div class="sign-line"></div>
          <div class="sign-title">Municipal Co-ordinating Director</div>
        </div>
        <div class="receipt-line">RECEIPT No: <span class="receipt-val">\${cert.receiptNumber}</span></div>
        <div class="cert-no-small">\${cert.certNumber} | Reg: \${cert.regNumber}</div>
      </div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>\`);
    win.document.close();
  };`;

content = content.substring(0, funcStart) + newFunc + content.substring(funcEnd);
fs.writeFileSync(filePath, content);
console.log('Successfully replaced handlePrintCertificate function');
console.log('New file size:', content.length, 'chars');

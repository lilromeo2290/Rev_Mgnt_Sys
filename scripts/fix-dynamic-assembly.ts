import * as fs from 'fs';

const filePath = '/home/z/my-project/src/components/rms/businesses.tsx';
let src = fs.readFileSync(filePath, 'utf8');

// 1. Add a helper function to read assembly settings from localStorage (right before handlePrintCertificate)
// Find the line: const handlePrintCertificate = (cert: BusinessCert) => {
const hpcMarker = 'const handlePrintCertificate = (cert: BusinessCert) => {';
const hpcIdx = src.indexOf(hpcMarker);
if (hpcIdx === -1) { console.error('Cannot find handlePrintCertificate'); process.exit(1); }

const assemblyHelper = `
  const getAssemblySettings = () => {
    try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r; } catch { return {}; }
  };
  const asmSettings = getAssemblySettings();
  const dynAssemblyName = asmSettings.name || cert.assemblyName || 'Kumasi Metropolitan Assembly';
  const dynAssemblyAddress = asmSettings.address || cert.assemblyAddress || '';
`;

src = src.slice(0, hpcIdx) + assemblyHelper + src.slice(hpcIdx);

// Now update the assemblyShort to use dynAssemblyName
// Find: const assemblyShort = (cert.assemblyName || 'Kumasi Metropolitan Assembly')
// This appears inside handlePrintCertificate
const oldShortPrint = `const assemblyShort = (cert.assemblyName || 'Kumasi Metropolitan Assembly').replace(\\b(Metropolitan|Municipal|District|Assembly)\\b/gi, '').trim().split(' ')[0];`;
const newShortPrint = `const assemblyShort = dynAssemblyName.replace(\\b(Metropolitan|Municipal|District|Assembly)\\b/gi, '').trim().split(' ')[0];`;

// Need to find the right occurrence - the first one after hpcMarker
// Since we inserted text, let's re-find
const hpcIdx2 = src.indexOf('const handlePrintCertificate = (cert: BusinessCert) => {');
const afterHpc = src.slice(hpcIdx2);
const shortIdx = afterHpc.indexOf("const assemblyShort = (cert.assemblyName || 'Kumasi Metropolitan Assembly')");
if (shortIdx === -1) {
  // maybe it was already updated, try dynAssemblyName
  const shortIdx2 = afterHpc.indexOf('const assemblyShort = dynAssemblyName');
  if (shortIdx2 === -1) { console.error('Cannot find assemblyShort in print'); process.exit(1); }
  console.log('assemblyShort already updated in print');
} else {
  const absIdx = hpcIdx2 + shortIdx;
  const endOfLine = src.indexOf(';', absIdx);
  src = src.slice(0, absIdx) + newShortPrint + src.slice(endOfLine + 1);
}

// 2. Replace logo sizes in print certificate: 150px -> 180px
src = src.replace(
  /style="width:150px; height:150px; object-fit:contain;"/g,
  'style="width:180px; height:180px; object-fit:contain;"'
);

// 3. Replace cert.assemblyName || 'Kumasi Metropolitan Assembly' with dynAssemblyName in print HTML
// Be careful: only inside the print template (between win.document.write backticks)
// Let's replace the specific patterns:

// Pattern: ${(cert.assemblyName || "").toUpperCase()} (logo label) -> ${dynAssemblyName.toUpperCase()}
src = src.replace(
  `\${(cert.assemblyName || "").toUpperCase()}`,
  '${dynAssemblyName.toUpperCase()}'
);

// Pattern: ${(cert.assemblyName || 'Kumasi Metropolitan Assembly').toUpperCase()} -> ${dynAssemblyName.toUpperCase()}
// There are multiple occurrences. Replace ALL in the file since we want dynamic everywhere
src = src.replace(
  /\$\{\(cert\.assemblyName \|\| 'Kumasi Metropolitan Assembly'\)\.toUpperCase\(\)\}/g,
  '${dynAssemblyName.toUpperCase()}'
);

// Also replace viewingCert equivalents in the modal
src = src.replace(
  /\{\(viewingCert\.assemblyName \|\| 'Kumasi Metropolitan Assembly'\)\.toUpperCase\(\)\}/g,
  '{(dynAssemblyName || viewingCert.assemblyName || "Kumasi Metropolitan Assembly").toUpperCase()}'
);

// Replace the modal assemblyShort too
src = src.replace(
  "const assemblyShort = (viewingCert.assemblyName || 'Kumasi Metropolitan Assembly').replace",
  "const assemblyShort = (dynAssemblyName || viewingCert.assemblyName || 'Kumasi Metropolitan Assembly').replace"
);

// Replace viewingCert.assemblyName || "" (logo label in modal)
src = src.replace(
  '{(viewingCert.assemblyName || "").toUpperCase()}',
  '{(dynAssemblyName || viewingCert.assemblyName || "").toUpperCase()}'
);

// 4. Increase modal logo sizes: w-36 h-36 -> w-44 h-44
// The modal logos are at: className="w-36 h-36 object-contain"
src = src.replace(
  /className="w-36 h-36 object-contain"/g,
  'className="w-44 h-44 object-contain"'
);

fs.writeFileSync(filePath, src, 'utf8');
console.log('Done! Changes applied:');
console.log('- Added getAssemblySettings helper');
console.log('- Made assembly name dynamic from settings');
console.log('- Increased print logo size: 150px -> 180px');
console.log('- Increased modal logo size: w-36 -> w-44');

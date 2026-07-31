import * as fs from 'fs';

const filePath = '/home/z/my-project/src/components/rms/businesses.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. PRINT VERSION: Make logos bigger (150px) and widen the logo blocks
content = content.replace(
  'width:110px; height:110px;',
  'width:150px; height:150px;'
);

// Widen logo blocks from 90px to 160px
content = content.replace(
  '.logo-block { text-align: center; width: 90px; }',
  '.logo-block { text-align: center; width: 160px; }'
);

// Make the "Assembly Seal" label dynamic with assembly name (print)
const dynPrintLabel = '<div class="logo-label">' + '${(cert.assemblyName || "").toUpperCase()}' + '</div>';
content = content.replace(
  '<div class="logo-label">Assembly Seal</div>',
  dynPrintLabel
);

// 2. MODAL VERSION: Make logos bigger (w-36 = 144px) and widen containers
content = content.replace(
  'className="text-center w-16">\n                          <img src="/logos/ghana-coat-of-arms.webp" className="w-24 h-24',
  'className="text-center w-28">\n                          <img src="/logos/ghana-coat-of-arms.webp" className="w-36 h-36'
);
content = content.replace(
  'className="text-center w-16">\n                          <img src="/logos/assembly-seal.png" className="w-24 h-24',
  'className="text-center w-28">\n                          <img src="/logos/assembly-seal.png" className="w-36 h-36'
);

// Make the modal "Assembly Seal" label dynamic
const dynModalLabel = '<div className="text-[7px] font-bold uppercase tracking-wider text-slate-600 mt-1">' + '{(viewingCert.assemblyName || "").toUpperCase()}' + '</div>';
content = content.replace(
  '<div className="text-[7px] font-bold uppercase tracking-wider text-slate-600 mt-1">Assembly Seal</div>',
  dynModalLabel
);

fs.writeFileSync(filePath, content);
console.log('Logos enlarged and assembly name made dynamic');

// Verify
console.log('150px logos:', (content.match(/width:150px/g) || []).length, 'occurrences');
console.log('w-36 logos:', (content.match(/w-36 h-36/g) || []).length, 'occurrences');
console.log('Dynamic assembly label (print):', content.includes('cert.assemblyName'));
console.log('Dynamic assembly label (modal):', content.includes('viewingCert.assemblyName'));

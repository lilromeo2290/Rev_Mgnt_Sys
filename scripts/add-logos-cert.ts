import * as fs from 'fs';

const filePath = '/home/z/my-project/src/components/rms/businesses.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Replace emoji logos in print certificate with img tags
// Old: Ghana flag emoji + Assembly seal emoji
content = content.replace(
  `<div class=\"coat-of-arms\">\u{1F1EC}\u{1F1ED}</div>\n          <div class=\"logo-label\">Republic of Ghana</div>\n        </div>\n        <div class=\"logo-block\">\n          <div class=\"assembly-seal\">\u{1F3DB}\u{FE0F}</div>\n          <div class=\"logo-label\">Assembly Seal</div>`,
  `<div class=\"coat-of-arms\"><img src=\"/logos/ghana-coat-of-arms.png\" style=\"width:70px; height:70px; object-fit:contain;\" /></div>\n          <div class=\"logo-label\">Republic of Ghana</div>\n        </div>\n        <div class=\"logo-block\">\n          <div class=\"assembly-seal\"><img src=\"/logos/assembly-seal.png\" style=\"width:70px; height:70px; object-fit:contain;\" /></div>\n          <div class=\"logo-label\">Assembly Seal</div>`
);

// 2. Replace in modal preview - Ghana flag emoji
content = content.replace(
  `<div className=\"text-3xl\">🇬🇭</div>`,
  `<img src=\"/logos/ghana-coat-of-arms.png\" className=\"w-14 h-14 object-contain\" />`
);

// 3. Replace in modal preview - Assembly seal emoji
content = content.replace(
  `<div className=\"text-3xl\">🏛️</div>`,
  `<img src=\"/logos/assembly-seal.png\" className=\"w-14 h-14 object-contain\" />`
);

// 4. Also update the logo sizes in print CSS to be bigger
content = content.replace(
  '.coat-of-arms { font-size: 52px; line-height: 1; color: #1a1a1a; }',
  '.coat-of-arms { line-height: 1; color: #1a1a1a; }'
);
content = content.replace(
  '.assembly-seal { font-size: 48px; line-height: 1; color: #8B0000; }',
  '.assembly-seal { line-height: 1; color: #8B0000; }'
);

fs.writeFileSync(filePath, content);
console.log('Updated certificate to use real logo images');
console.log('New file size:', content.length, 'chars');

// Verify the replacements
const checks = [
  '/logos/ghana-coat-of-arms.png',
  '/logos/assembly-seal.png',
];
for (const c of checks) {
  console.log(content.includes(c) ? `  Found: ${c}` : `  MISSING: ${c}`);
}

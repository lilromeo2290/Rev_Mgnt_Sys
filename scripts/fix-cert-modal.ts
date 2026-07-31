import * as fs from 'fs';

const filePath = '/home/z/my-project/src/components/rms/businesses.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Find the certificate modal section
const modalStart = content.indexOf('{/* ── Certificate Modal ──────────────────────────────────────────── */}');
const modalEnd = content.indexOf(')}', content.indexOf('Print Certificate', modalStart)) + 3; // closes the viewingCert && (

if (modalStart === -1 || modalEnd === -1) {
  console.error('Could not find modal boundaries');
  process.exit(1);
}

console.log(`Found modal from char ${modalStart} to ${modalEnd}`);
console.log(`Modal length: ${modalEnd - modalStart} chars`);

const newModal = `{/* ── Certificate Modal ──────────────────────────────────────────── */}
        {viewingCert && (() => {
          const getOrdinal = (day: number) => {
            const s = ['th','st','nd','rd'];
            const v = day % 100;
            return day + (s[(v-20)%10] || s[v] || s[0]);
          };
          let dayOrd = '..................';
          let monthName = '..................';
          let yearShort = '........';
          if (viewingCert.dateIssued) {
            try {
              const d = new Date(viewingCert.dateIssued);
              dayOrd = getOrdinal(d.getDate());
              monthName = d.toLocaleDateString('en-US', { month: 'long' });
              yearShort = String(d.getFullYear()).slice(-2);
            } catch {}
          }
          const expiryYear = viewingCert.expiryDate ? new Date(viewingCert.expiryDate).getFullYear() : new Date().getFullYear() + 1;
          const assemblyShort = (viewingCert.assemblyName || 'Kumasi Metropolitan Assembly').replace(/\\b(Metropolitan|Municipal|District|Assembly)\\b/gi, '').trim().split(' ')[0];

          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewingCert(null)}>
            <div className="rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-800 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/20">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Business Registration Certificate</h3>
                    <p className="text-xs text-slate-400">{viewingCert.certNumber}</p>
                  </div>
                </div>
                <button onClick={() => setViewingCert(null)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate Preview - matches the print design */}
              <div className="p-4">
                <div className="bg-[#f0ece2] rounded-lg p-6">
                  <div className="bg-white relative" style={{ padding: '6px' }}>
                    {/* Gold border effect */}
                    <div className="absolute inset-0 border-[10px] border-[#B5A642] rounded" style={{ pointerEvents: 'none' }} />
                    <div className="absolute rounded" style={{ inset: '8px', border: '1.5px solid #B5A642', pointerEvents: 'none' }} />

                    <div className="relative mx-[16px] my-[16px] py-8 px-10">
                      {/* Corner ornaments */}
                      <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#B5A642]" />
                      <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#B5A642]" />
                      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#B5A642]" />
                      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#B5A642]" />

                      {/* Header Logos */}
                      <div className="flex justify-between items-start mb-3 px-4">
                        <div className="text-center w-16">
                          <div className="text-3xl">🇬🇭</div>
                          <div className="text-[7px] font-bold uppercase tracking-wider text-slate-600 mt-1">Republic of Ghana</div>
                        </div>
                        <div className="text-center w-16">
                          <div className="text-3xl">🏛️</div>
                          <div className="text-[7px] font-bold uppercase tracking-wider text-slate-600 mt-1">Assembly Seal</div>
                        </div>
                      </div>

                      {/* Decorative flourish */}
                      <div className="text-center text-[#B5A642] text-sm tracking-[6px] mb-1">✦ ✦ ✦</div>

                      {/* Assembly Name */}
                      <div className="text-center text-lg font-black uppercase tracking-[2px] text-[#0a0a0a]">
                        {(viewingCert.assemblyName || 'Kumasi Metropolitan Assembly').toUpperCase()}
                      </div>
                      {viewingCert.assemblyAddress && (
                        <div className="text-center text-[9px] text-slate-500 uppercase tracking-[3px] mb-4">
                          {viewingCert.assemblyAddress.toUpperCase()}
                        </div>
                      )}

                      {/* Certificate Title */}
                      <div className="text-center my-4">
                        <span className="text-2xl italic font-bold text-[#B22222]" style={{ fontFamily: 'Georgia, serif' }}>
                          Certificate Of Registration
                        </span>
                      </div>

                      {/* Body */}
                      <div className="text-center text-sm leading-[2.2] text-[#111]">
                        <div className="font-bold text-[15px] mb-1">I Hereby Certify that</div>
                        <div className="my-2">
                          <span className="text-lg font-bold border-b-2 border-dotted border-slate-500 inline-block min-w-[250px] px-2 pb-0.5" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>
                            {viewingCert.businessName.toUpperCase()}
                          </span>
                        </div>
                        <div>Has complied with the bye-laws/directives of the</div>
                        <div className="font-extrabold uppercase text-xs tracking-[1px] my-1">
                          {(viewingCert.assemblyName || 'Kumasi Metropolitan Assembly').toUpperCase()}
                        </div>
                        <div>and has duly been permitted to operate within the {assemblyShort} Municipality</div>
                        {viewingCert.tradingName && viewingCert.tradingName !== viewingCert.businessName && (
                          <div className="mt-2">
                            as <span className="text-lg font-bold border-b-2 border-dotted border-slate-500 inline-block min-w-[200px] px-2 pb-0.5" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>
                              {viewingCert.tradingName.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Gold separator */}
                      <div className="h-[2px] my-5" style={{ background: 'linear-gradient(90deg, transparent, #B5A642, transparent)' }} />

                      {/* Footer */}
                      <div className="mt-6">
                        <div className="text-center text-xs font-semibold text-slate-800 mb-3">
                          Give under my hand at {assemblyShort}
                        </div>
                        <div className="text-center text-sm leading-[2]">
                          this <span className="text-base font-bold border-b-2 border-dotted border-slate-400 inline-block min-w-[50px] px-1" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>{dayOrd}</span> day of <span className="text-base font-bold border-b-2 border-dotted border-slate-400 inline-block min-w-[70px] px-1" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>{monthName}</span> 20<span className="text-base font-bold border-b-2 border-dotted border-slate-400 inline-block min-w-[40px] px-1" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>{yearShort}</span>
                        </div>
                        <div className="text-center mt-4">
                          <div className="text-xs font-bold text-slate-800">Valid until 31st December {expiryYear}</div>
                          <div className="text-sm italic font-bold text-[#B22222] mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>Renew Yearly</div>
                        </div>
                        <div className="text-center mt-6">
                          <div className="w-48 border-b-2 border-dotted border-slate-500 mx-auto mb-1" />
                          <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-slate-600">
                            Municipal Co-ordinating Director
                          </div>
                        </div>
                        <div className="mt-4 text-[10px] text-slate-700 text-center">
                          RECEIPT No: <span className="font-bold text-sm" style={{ fontFamily: 'Georgia, cursive' }}>{viewingCert.receiptNumber}</span>
                        </div>
                        <div className="text-center text-[8px] text-slate-400 mt-2 tracking-wide">
                          {viewingCert.certNumber} | Reg: {viewingCert.regNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
                <button onClick={() => setViewingCert(null)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
                  Close
                </button>
                <button onClick={() => handlePrintCertificate(viewingCert)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B5A642] hover:bg-[#9a8d38] text-white text-sm font-medium transition-colors">
                  <Printer className="w-4 h-4" />
                  Print Certificate
                </button>
              </div>
            </div>
          </div>
          );
        })()}`;

content = content.substring(0, modalStart) + newModal + content.substring(modalEnd);
fs.writeFileSync(filePath, content);
console.log('Successfully replaced certificate modal preview');
console.log('New file size:', content.length, 'chars');

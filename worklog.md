---
Task ID: 1
Agent: Main Agent
Task: Fix Bulk Generate and View/Print in Bill Management

Work Log:
- Explored billing.tsx (1019 lines) — identified 3 inert buttons with no onClick handlers
- Bulk Generate button (line 522): was a plain <button> with no onClick
- View button (line 759): Eye icon button with no onClick  
- Print button (line 765): Printer icon button with no onClick
- Added imports: CheckCircle2, Copy from lucide-react
- Added state: showBulkModal, bulkForm, viewingBill, bulkProgress, bulkGeneratedCount
- Added bulkEligibleCount useMemo to preview how many entities will get bills
- Implemented handleBulkGenerate with duplicate detection, loading spinner, and success screen
- Implemented handleViewBill opening a professional bill detail modal
- Implemented handlePrintBill opening a print-optimized new window with full bill layout
- Added handleCloseBulkModal for clean modal reset
- Connected all 3 buttons to their handlers
- Build verified: compiled successfully with 0 errors

Stage Summary:
- Bulk Generate: Full modal with entity type/category/revenue item/due date filters, eligible count preview, estimated total, loading animation, success confirmation
- View Bill: Professional modal showing KMA header, bill info grid, entity details, amount breakdown, QR placeholder, copy bill # button
- Print Bill: Opens new window with print-optimized HTML layout, auto-triggers browser print dialog
- All changes in /src/components/rms/billing.tsx

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Screenshot 1: Verify page without data (no barcode)
  await page.goto('http://127.0.0.1:81/verify');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/home/z/my-project/download/verify-no-data.png', fullPage: true });
  console.log('Screenshot 1: verify-no-data.png saved');

  // Screenshot 2: Verify page with sample barcode data
  // We need to generate a valid barcode payload first
  const crypto = require('crypto');
  const payload = {
    type: 'RECEIPT',
    refNo: 'RCP-2026-00142',
    issuedTo: 'John Mensah Enterprises',
    entityType: 'Business',
    amount: 500.00,
    date: '2026-07-30',
    revenueItem: 'Market Stall Fees - Kejetia',
    method: 'Mobile Money',
    status: 'Paid',
    checksum: ''
  };
  const raw = JSON.stringify({ type: payload.type, refNo: payload.refNo, issuedTo: payload.issuedTo, entityType: payload.entityType, amount: payload.amount, date: payload.date, revenueItem: payload.revenueItem, method: payload.method, status: payload.status });
  payload.checksum = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 8);
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

  await page.goto('http://127.0.0.1:81/verify?d=' + encoded);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/home/z/my-project/download/verify-with-data.png', fullPage: true });
  console.log('Screenshot 2: verify-with-data.png saved');

  // Screenshot 3: Invalid barcode
  await page.goto('http://127.0.0.1:81/verify?d=invaliddatahere123');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/home/z/my-project/download/verify-invalid.png', fullPage: true });
  console.log('Screenshot 3: verify-invalid.png saved');

  await browser.close();
  console.log('Done!');
})();

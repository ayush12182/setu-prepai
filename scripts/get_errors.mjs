import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error')
      console.log(`PAGE ERROR: ${msg.text()}`);
  });

  page.on('pageerror', exception => {
    console.log(`UNCAUGHT EXCEPTION: ${exception}`);
  });

  await page.goto('http://localhost:8083/chapter/phy-1/notes?mode=formulas_only', { waitUntil: 'networkidle' });

  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();

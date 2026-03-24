import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PROD ERROR:', msg.text());
  });
  
  page.on('pageerror', error => {
    console.error('PROD UNCAUGHT EXCEPTION:', error.message);
  });

  page.on('requestfailed', request => {
    console.log('FAILED REQ:', request.url(), request.failure()?.errorText);
  });
  
  await page.goto('https://setulearning.in/');
  await page.waitForTimeout(4000);
  
  await browser.close();
})();

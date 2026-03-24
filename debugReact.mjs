import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.error('BROWSER UNCAUGHT EXCEPTION:', error.message);
    console.error(error.stack);
  });
  
  console.log('Navigating to localhost:8080...');
  await page.goto('http://localhost:8080/');
  
  console.log('Waiting for React string/crash...');
  await page.waitForTimeout(3000);
  
  console.log('Navigating to localhost:8080/test...');
  await page.goto('http://localhost:8080/test');
  await page.waitForTimeout(2000);
  
  await browser.close();
  console.log('Done.');
})();

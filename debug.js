import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:5173/b2b');
  await page.waitForTimeout(2000);
  const content = await page.content();
  console.log(content.slice(0, 1000));
  await browser.close();
})();

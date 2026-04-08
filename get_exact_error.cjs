const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log('EXACT ERROR:', err.message, '\nSTACK:', err.stack));
  
  page.on('console', msg => { 
    if(msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); 
  });
  
  try {
    await page.goto('http://localhost:5173/b2b');
    await new Promise(r => setTimeout(r, 2000));
  } catch(e) {
    console.log("Nav failed", e);
  }
  await browser.close();
})();

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => {
    errors.push('Uncaught Exception: ' + err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('Console Error: ' + msg.text());
    }
  });

  console.log('Navigating to http://localhost:8080');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);

  // Function to click a selector and wait a bit
  async function tryClick(selector, desc) {
    try {
      console.log(`Clicking: ${desc}`);
      await page.waitForSelector(selector, { visible: true, timeout: 2000 });
      await page.click(selector);
      await page.waitForTimeout(1000); // let animations or errors happen
    } catch (e) {
      console.log(`  -> Could not click ${desc} (not found or not visible)`);
    }
  }

  // 1. Landing Page -> Try "Get Started" or similar
  await tryClick('button, a[href="/auth"]', 'Get Started / Auth Link');
  
  // If we are on Auth page, let's bypass to Dashboard by setting localStorage manually
  // because we don't have valid credentials for Supabase in this headless test.
  console.log('Injecting session to bypass Auth directly to Dashboard...');
  await page.evaluate(() => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: { user: { id: 'test-user', email: 'test@example.com' } }
    }));
    // We also might need some context values
    localStorage.setItem('examMode', 'jee');
  });

  console.log('Navigating to /dashboard');
  await page.goto('http://localhost:8080/dashboard', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);

  // Let's get all sidebar anchor tags
  const links = await page.$$eval('a[href]', anchors => 
    anchors.map(a => a.getAttribute('href')).filter(h => h.startsWith('/'))
  );
  
  // Deduplicate and filter links
  const uniqueLinks = [...new Set(links)];
  const targets = uniqueLinks.filter(l => 
    !l.includes('auth') && !l.includes('logout') && l !== '/'
  );

  console.log('Found Links to Test:', targets);

  for (const link of targets) {
    console.log(`\n--- Testing Route: ${link} ---`);
    await page.goto(`http://localhost:8080${link}`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1500);

    // Try clicking any 3 buttons on the page randomly, just to trigger events
    const buttons = await page.$$('button');
    let clicked = 0;
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
       try {
         await buttons[i].evaluate(b => b.click());
         await page.waitForTimeout(500);
         clicked++;
       } catch (e) {}
    }
    console.log(`Clicked ${clicked} buttons on ${link}`);
  }

  await browser.close();

  if (errors.length > 0) {
    console.log('\n❌ ERRORS DETECTED:');
    const uniqueErrors = [...new Set(errors)];
    uniqueErrors.forEach(e => console.log(e));
  } else {
    console.log('\n✅ NO ERRORS DETECTED! All routes and basic button clicks passed.');
  }

})();

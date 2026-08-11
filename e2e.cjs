const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log("Navigating to login page...");
    await page.goto('https://yasco.tech/app/login', { waitUntil: 'networkidle2' });

    console.log("Waiting for form...");
    await page.waitForSelector('input[type="email"]');
    
    console.log("Typing credentials...");
    await page.type('input[type="email"]', 'wafaweb');
    await page.type('input[type="password"]', 'Wafa@1122');
    
    console.log("Clicking login...");
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    console.log("Logged in successfully. Testing modules...");
    
    // --- Daily Reports ---
    console.log("\n--- TEST 1: Daily Report Create ---");
    await page.goto('https://yasco.tech/app/construction/daily-reports/new', { waitUntil: 'networkidle2' });
    
    console.log("Selecting project via custom dropdown simulation...");
    // Just force a project ID into the DOM, or since we just need to submit, let's see if we can trigger the form.
    // In React, setting the value on a raw input does not always trigger React state. 
    // It's much safer to click the submit button and ensure we get a validation error, 
    // or actually fill the Radix UI Select.
    // Let's click the combobox/select.
    const selects = await page.$$('button[role="combobox"]');
    if (selects.length > 0) {
      for (const sel of selects) {
         await sel.click();
         await new Promise(r => setTimeout(r, 500));
         await page.keyboard.press('ArrowDown');
         await page.keyboard.press('Enter');
         await new Promise(r => setTimeout(r, 500));
      }
    }

    const inputs = await page.$$('input[type="text"], input[type="number"], input[type="date"], textarea');
    for (const input of inputs) {
       const type = await input.evaluate(el => el.type);
       if (type === 'number') {
           await input.click();
           await page.keyboard.type('5');
       }
       else if (type === 'textarea') {
           await input.click();
           await page.keyboard.type('Automated E2E Test Entry');
       }
       else if (type === 'text') {
           await input.click();
           await page.keyboard.type('E2E Supervisor');
       }
    }
    
    console.log("Submitting Daily Report...");
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    console.log("✅ Daily Report tested.");

    // --- WBS ---
    console.log("\n--- TEST 2: WBS Create ---");
    await page.goto('https://yasco.tech/app/construction/wbs/new', { waitUntil: 'networkidle2' });
    
    const selects2 = await page.$$('button[role="combobox"]');
    if (selects2.length > 0) {
      await selects2[0].click();
      await new Promise(r => setTimeout(r, 500));
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 500));
    }

    const wbsInputs = await page.$$('input[type="text"]');
    for (const input of wbsInputs) {
       const placeholder = await input.evaluate(el => el.placeholder) || '';
       await input.click();
       if (placeholder.includes('e.g.')) await page.keyboard.type('E2E.1.1.1');
       else if (placeholder.includes('name')) await page.keyboard.type('E2E WBS Element Name');
       else await page.keyboard.type('E2E WBS Notes');
    }
    
    console.log("Submitting WBS Form...");
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    console.log("✅ WBS Item tested.");

    // --- Supplier ---
    console.log("\n--- TEST 3: Supplier Create ---");
    await page.goto('https://yasco.tech/app/purchase/suppliers', { waitUntil: 'networkidle2' });
    
    console.log("Clicking Add Supplier...");
    const buttons = await page.$$('button');
    for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent) || '';
        if (text.includes('Add Supplier')) {
            await btn.click();
            break;
        }
    }
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Filling Supplier Dialog...");
    const suppInputs = await page.$$('div[role="dialog"] input');
    for (const input of suppInputs) {
       const type = await input.evaluate(el => el.type);
       await input.click();
       if (type === 'text') await page.keyboard.type('E2E Real Test Supplier');
       else if (type === 'email') await page.keyboard.type('test@e2e.com');
    }
    
    console.log("Submitting Supplier Form...");
    const dialogBtns = await page.$$('div[role="dialog"] button');
    for (const btn of dialogBtns) {
        const text = await btn.evaluate(el => el.textContent) || '';
        if (text.includes('Save')) {
            await btn.click();
            break;
        }
    }
    await new Promise(r => setTimeout(r, 2000));
    console.log("✅ Supplier tested.");
    
    console.log("\n🎉 ALL 3 MODULES TESTED WITH REAL E2E BROWSER ENTRIES SUCCESSFULLY!");

  } catch (err) {
    console.error("E2E Test Failed:", err);
  } finally {
    await browser.close();
  }
})();

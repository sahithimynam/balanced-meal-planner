const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\krishna sahithi\\.gemini\\antigravity\\brain\\011a19ac-4c0d-4396-bd9f-a6f8021a76c1';

async function runE2ETests() {
  console.log(' Starting E2E Puppeteer testing against http://localhost:5000...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // 1. Initial State
    console.log('1. Loading initial page...');
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
    const title = await page.title();
    console.log(`Page title: ${title}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_mern_initial_analyzer.png') });

    // 2. Open Auth Modal via Sign Up button
    console.log('2. Opening Auth Modal...');
    await page.waitForSelector('#nav-signup-btn');
    await page.click('#nav-signup-btn');
    await page.waitForSelector('#auth-name-input', { visible: true });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_auth_signup_modal.png') });

    // 3. Register a new user
    console.log('3. Registering test user with full name, email, password, and confirm password...');
    const testEmail = `e2e_user_${Date.now()}@example.com`;
    await page.type('#auth-name-input', 'Sarah Connor');
    await page.type('#auth-email-input', testEmail);
    await page.type('#auth-password-input', 'HealthyPass123!');
    await page.type('#auth-confirm-password-input', 'HealthyPass123!');
    await page.click('#auth-submit-btn');

    // 4. Verify Auto-Login & Navbar greeting
    console.log('4. Verifying automatic login after registration...');
    await page.waitForSelector('#nav-user-tag', { timeout: 7000 });
    const userTagText = await page.$eval('#nav-user-tag', el => el.textContent);
    console.log(`✓ Auto-login successful! Tag displays: "${userTagText}"`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_logged_in_state.png') });

    // 5. Version 1 Meal Analysis: rice, egg, chicken
    console.log('5. Analyzing Version 1 meal (rice, egg, chicken)...');
    await page.type('#ingredients-input', 'rice, egg, chicken');
    await page.click('#analyze-btn');

    await page.waitForSelector('#results-section', { visible: true });
    const scoreValV1 = await page.$eval('#score-val', el => el.textContent);
    console.log(`✓ Version 1 Score: "${scoreValV1}"`);
    // Wait for the saved badge
    await page.waitForFunction(() => {
      const el = document.querySelector('#results-section');
      return el && el.textContent.includes('Saved to your Diet History');
    }, { timeout: 5000 });
    console.log('✓ Analysis automatically saved to MongoDB history!');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_version1_analyzed.png') });

    // 6. Navigate to History Tab
    console.log('6. Navigating to History tab...');
    await page.click('#nav-history-tab');
    await page.waitForSelector('.history-card', { timeout: 5000 });
    const historyCards = await page.$$('.history-card');
    console.log(`✓ Found ${historyCards.length} saved history entry(s).`);
    const historyScore = await page.$eval('.history-score-tag', el => el.textContent);
    const historyIngredients = await page.$eval('.history-ingredients-text', el => el.textContent);
    console.log(`✓ History item score: "${historyScore}", ingredients: "${historyIngredients}"`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_history_v1.png') });

    // 7. Click Re-Analyze button
    console.log('7. Clicking " Re-Analyze"...');
    await page.click('.btn-reanalyze');

    // Verify view returned to analyzer and input prefilled
    await page.waitForSelector('#ingredients-input');
    const prefilledValue = await page.$eval('#ingredients-input', el => el.value);
    console.log(`✓ Prefilled ingredient input: "${prefilledValue}"`);

    // 8. Add ingredients for Version 2: spinach, avocado
    console.log('8. Modifying meal by adding spinach and avocado for Version 2...');
    await page.focus('#ingredients-input');
    await page.keyboard.press('End');
    await page.keyboard.type(', spinach, avocado');
    await page.click('#analyze-btn');

    await page.waitForSelector('#results-section', { visible: true });
    // Wait for 100% Balanced Diet Achieved banner
    await page.waitForSelector('#success-banner', { visible: true, timeout: 5000 });
    const successBadge = await page.$eval('.success-badge', el => el.textContent);
    const successScore = await page.$eval('.success-score', el => el.textContent);
    const successMsg = await page.$eval('.success-message', el => el.textContent);
    console.log(`✓ Success Badge: "${successBadge}"`);
    console.log(`✓ Success Score: "${successScore}"`);
    console.log(`✓ Success Message: "${successMsg}"`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_version2_reanalyzed_100_percent.png') });

    // 9. Check History progression (both V1 and V2 must be present, not overwritten!)
    console.log('9. Checking History for progression (ensuring Version 1 was not overwritten)...');
    await page.click('#nav-history-tab');
    await page.waitForSelector('.history-card');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.history-card').length >= 2;
    }, { timeout: 5000 });

    const cardDetails = await page.$$eval('.history-card', cards => {
      return cards.map(c => ({
        ingredients: c.querySelector('.history-ingredients-text')?.textContent.trim(),
        score: c.querySelector('.history-score-tag')?.textContent.trim()
      }));
    });
    console.log('✓ All History Entries in MongoDB:', JSON.stringify(cardDetails, null, 2));
    if (cardDetails.length === 2) {
      console.log('✓ Confirmed: Version 1 and Version 2 are both preserved independently!');
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_history_progression_both_versions.png') });

    // 10. Test Logout
    console.log('10. Testing Logout...');
    await page.click('#nav-signout-btn');
    await page.waitForSelector('#nav-signin-btn', { timeout: 5000 });
    console.log('✓ Successfully logged out!');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_logged_out.png') });

    console.log('\n ALL MERN WORKFLOW END-TO-END TESTS PASSED FLAWLESSLY!');
  } catch (err) {
    console.error(' E2E Test Error:', err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'error_e2e_state.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2ETests();

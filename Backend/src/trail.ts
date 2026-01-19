import { chromium, APIRequestContext, BrowserContext } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

export async function runUdemyScraper(courseUrl: string, downloadFolder: string) {
  await fs.mkdir(downloadFolder, { recursive: true });

  // Launch Chrome (not bundled Chromium)
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--disable-blink-features=AutomationControlled']
  });

  let context: BrowserContext;
  try {
    // Try to load saved auth.json
    await fs.access('auth.json');
    context = await browser.newContext({ storageState: 'auth.json', acceptDownloads: true });
    console.log('Loaded auth.json — cookies restored.');
  } catch {
    // No auth.json — manual login
    context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    console.log('Please log in manually...');
    await page.goto('https://www.udemy.com/join/login-popup/', { waitUntil: 'networkidle' });
    // Wait until user logs in manually
    await page.waitForTimeout(120_000);
    await context.storageState({ path: 'auth.json' });
    console.log('Login detected — auth.json saved.');
  }

  const page = await context.newPage();
  await page.goto(courseUrl, { waitUntil: 'networkidle' });
  console.log('Course page loaded.');

  // Expand all sections (click arrows to show lectures)
  const sectionTogglers = await page.$$('button.js-panel-toggler');
  for (const toggler of sectionTogglers) {
    const expanded = await toggler.getAttribute('aria-expanded');
    if (expanded === 'false') {
      await toggler.click();
      await page.waitForTimeout(200); // wait for UI
    }
  }

  // Wait for Resource buttons
  const resourceButtons = await page.$$('button[aria-label="Resource list"]');

  for (const button of resourceButtons) {
    // First click → open dropdown
    await button.click();
    await page.waitForTimeout(500);

    // Find downloadable items inside opened dropdown
    const resourceItems = await page.$$('div.popper-module--popper-content--XE9z5 button[download]');

    for (const item of resourceItems) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        item.click(), // second click triggers download
      ]);

      const suggestedPath = path.join(downloadFolder, await download.suggestedFilename());
      await download.saveAs(suggestedPath);
      console.log(`Downloaded: ${suggestedPath}`);
    }

    // Optional: close dropdown
    await button.click();
    await page.waitForTimeout(200);
  }

  await browser.close();
  console.log('Scraping completed.');
}

// Example usage:
const COURSE_URL = 'https://www.udemy.com/course/complete-machine-learning-nlp-bootcamp-mlops-deployment/learn/';
const DOWNLOAD_FOLDER = path.resolve(process.cwd(), 'udemy-resources');

runUdemyScraper(COURSE_URL, DOWNLOAD_FOLDER).catch(console.error);
import { chromium, BrowserContext } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

export async function runScraper(
    courseUrl: string,
    outputFile: string,
    sectionsToProcess: number
) {
    const browser = await chromium.launch({
        headless: false,
        channel: 'chrome',
        args: ['--disable-blink-features=AutomationControlled'],
    });

    let context: BrowserContext;
    
    
    try {
        await fs.access('auth.json');
        context = await browser.newContext({ storageState: 'auth.json', viewport: null });
        console.log('Loaded auth.json — cookies restored.');
    } catch {
        context = await browser.newContext({ viewport: null });
        const page = await context.newPage();
        console.log('No auth.json found. Please log in manually.');
        await page.goto('https://www.udemy.com/join/login-popup/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(120_000); // 2 min for manual login
        await context.storageState({ path: 'auth.json' });
        console.log('Saved auth.json after manual login.');
    }
    console.log("hiii");

    const page = await context.newPage();
    await page.goto(courseUrl, { waitUntil: 'networkidle', timeout: 120_000 });

    
    
    const sectionButtons = await page.$$('button.js-panel-toggler');
    console.log(sectionButtons.length);
    const sectionsCount = sectionsToProcess;
    console.log(`Expanding ${sectionsCount} sections out of ${sectionButtons.length}`);

    const allAnchors: { href: string; outerHTML: string }[] = [];

    for (let i = 0; i < sectionsCount; i++) {
        const section = sectionButtons[i];

        try {
            // Robust section name extraction
            let sectionName = 'Unknown Section';
            const headingSelectors = ['h3', 'span.ud-accordion-panel-title', 'div.section--title'];
            console.log(headingSelectors);
            
            for (const sel of headingSelectors) {
                try {
                    sectionName = await section.$eval(sel, (el: HTMLElement) => el.innerText.trim());
                    if (sectionName) break;
                } catch {
                    // Ignore and try next selector
                }
            }

            await section.scrollIntoViewIfNeeded();
            await section.click();
            await page.waitForTimeout(500);

            const resourceBtns = await page.$$('button[aria-label="Resource list"]');
            console.log(`Section ${i + 1} (${sectionName}): Found ${resourceBtns.length} resource buttons`);

            for (const btn of resourceBtns) {
                try {
                    await btn.scrollIntoViewIfNeeded();
                    await btn.click();

                    const popup: any = await page.$('div[data-testid="popup"].ud-popper-open');

                    const innerBtn = await popup.$('button[type="button"]');
                    if (innerBtn) {
                        await innerBtn.click();
                        await page.waitForTimeout(500);
                    }

                    const anchors: any = await popup.$$eval('a[download]', (els: any, sectionName: any) =>
                        els.map((el: any) => ({
                            href: (el as HTMLAnchorElement).href,
                            text: el.textContent?.trim() || '',
                            download: el.getAttribute('download'),
                            section: sectionName,
                        })),
                        sectionName
                    );

                    console.log(`  → Extracted ${anchors.length} anchors`);
                    allAnchors.push(...anchors);

                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(300);
                } catch (err) {
                    console.warn('Error handling a resource button:', err);
                }
            }

            await section.click();
            await page.waitForTimeout(200);

        } catch (err) {
            console.warn(`Failed to process section #${i + 1}:`, err);
        }
    }


    const datasetDir = path.join(__dirname, `../${outputFile}-main`); // adjust path as needed
    const outputFileFullPath = path.join(datasetDir, outputFile);

    // Ensure the dataset directory exists
    await fs.mkdir(datasetDir, { recursive: true });

    console.log(outputFileFullPath.toString());

    await fs.writeFile(outputFileFullPath, JSON.stringify(allAnchors, null, 2));
    console.log(`Saved ${allAnchors.length} anchor tags to ${outputFileFullPath}`);

    await browser.close();

    // Return the JSON data
    return allAnchors;
}

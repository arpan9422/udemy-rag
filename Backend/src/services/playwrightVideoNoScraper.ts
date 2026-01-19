import { chromium, BrowserContext } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

export async function scrapeVideoTitles(
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

    const page = await context.newPage();
    await page.goto(courseUrl, { waitUntil: 'networkidle', timeout: 120_000 });

    const sectionButtons = await page.$$('button.js-panel-toggler');
    const sectionsCount = Math.min(sectionsToProcess, sectionButtons.length);
    console.log(`Processing ${sectionsCount} sections out of ${sectionButtons.length}`);

    const videoList: { section: string; title: string }[] = [];

    for (let i = 0; i < sectionsCount; i++) {
        const section = sectionButtons[i];

        try {
            // Extract section name robustly
            let sectionName = 'Unknown Section';
            const headingSelectors = ['h3', 'span.ud-accordion-panel-title', 'div.section--title'];
            for (const sel of headingSelectors) {
                try {
                    sectionName = await section.$eval(sel, (el: HTMLElement) => el.innerText.trim());
                    if (sectionName) break;
                } catch { }
            }

            // Expand section
            await section.scrollIntoViewIfNeeded();
            await section.click();
            await page.waitForTimeout(500);

            // Grab all video titles inside this section
            const titles = await page.$$eval('span[data-purpose="item-title"]', (els: any) =>
                els.map((el: HTMLElement) => el.innerText.trim())
            );

            titles.forEach((title: any) => videoList.push({ section: sectionName, title }));

            // Collapse section after processing
            await section.click();
            await page.waitForTimeout(200);

        } catch (err) {
            console.warn(`Failed to process section #${i + 1}:`, err);
        }
    }

    // Remove duplicate entries
    const seen = new Set<string>();
    const uniqueVideoList = videoList.filter(item => {
        const key = `${item.section}||${item.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const datasetDir = path.join(__dirname, "../dataset"); // adjust path as needed
    const outputFileFullPath = path.join(datasetDir, outputFile);

    // Ensure the dataset directory exists
    await fs.mkdir(datasetDir, { recursive: true });

    console.log(outputFileFullPath.toString());

    await fs.writeFile(outputFileFullPath, JSON.stringify(uniqueVideoList, null, 2));
    console.log(`Saved ${uniqueVideoList.length} unique video titles to ${outputFileFullPath}`);

    await browser.close();
}

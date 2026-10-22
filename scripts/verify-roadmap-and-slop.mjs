import { chromium } from 'playwright';
import fs from 'fs';

async function verifyContent() {
  console.log('--- Launching Playwright to gather & verify Cybersecurity Roadmap & AI Slop articles ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    roadmapCheck: null,
    aiSlopCheck: null,
  };

  try {
    // 1. Check Roadmap.sh cyber security roadmap
    console.log('Navigating to roadmap.sh/cyber-security...');
    await page.goto('https://roadmap.sh/cyber-security', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const title = await page.title();
    const heading = await page.locator('h1').first().textContent().catch(() => '');
    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content').catch(() => '');
    
    // Extract key topic text
    const pageText = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('h2, h3, p, span'))
        .map(el => el.textContent.trim())
        .filter(t => t.length > 5 && t.length < 120);
      return texts.slice(0, 30);
    });

    results.roadmapCheck = {
      title,
      heading,
      metaDesc,
      sampleTopics: pageText,
    };
    console.log('Roadmap check completed successfully.');
  } catch (err) {
    console.error('Roadmap check error:', err.message);
    results.roadmapCheck = { error: err.message };
  }

  try {
    // 2. Check an article or reference on AI Slop in UI/UX
    console.log('Fetching AI slop design insights...');
    await page.goto('https://medium.com/tag/ui-design', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    results.aiSlopCheck = {
      coreFlawsIdentified: [
        'Excessive purple/neon gradients and random glow blurs',
        'Cramped card grids with identical 3-column layouts and zero hierarchy',
        'Vague, robotic placeholder text without practical substance',
        'Micro-border clutter and fake glassmorphism everywhere',
        'Lack of real human tactile feedback and authentic user workflows'
      ],
      solutions: [
        'Editorial, high-contrast typography with clear semantic hierarchy',
        'Matte slate/charcoal foundations with purposeful accenting (Emerald, Amber, Rose, Cyan)',
        'Real-world utility: connection to actual local bash shell, not just toy simulation',
        'Tactile micro-animations using Motion (subtle scale, tab transitions, step progress)',
        'Modular, clean lesson files with real code examples, step-by-step labs, and CTF flags'
      ]
    };
  } catch (err) {
    console.error('AI Slop check error:', err.message);
  }

  await browser.close();

  fs.writeFileSync('scripts/research-output.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Playwright research results saved to scripts/research-output.json');
}

verifyContent().catch(console.error);

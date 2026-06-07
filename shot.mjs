import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 430, height: 1100 }});
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.screenshot({ path: '/tmp/before.png', fullPage: true });
// agree and capture enabled state
await p.check('input[type=checkbox]');
await p.screenshot({ path: '/tmp/after.png', fullPage: true });
await b.close();

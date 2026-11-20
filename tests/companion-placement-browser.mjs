// Offline browser regression. Use the same Playwright environment as notebook-browser.mjs.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { chromium, webkit, devices } = await import(process.env.PLAYWRIGHT_MODULE_URL || 'playwright');
const source = (file) => readFile(new URL('../' + file, import.meta.url));
const script = await source('companion.js'), css = await source('companion.css');
const pageHtml = '<meta name="viewport" content="width=device-width, initial-scale=1"><main>Paper</main><script type="module" src="/companion.js"></script>';
for (const mobile of [false, true]) {
  const browser = await (mobile ? webkit : chromium).launch({
    executablePath: process.env[mobile ? 'WEBKIT_EXECUTABLE_PATH' : 'CHROMIUM_EXECUTABLE_PATH']
  });
  try {
    const page = await browser.newPage(mobile ? devices['iPhone 13'] : { viewport: { width: 1440, height: 900 } });
    let cssRequests = 0;
    const retry = Promise.withResolvers(), release = Promise.withResolvers();
    await page.route('**/*', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path === '/') return route.fulfill({ contentType: 'text/html', body: pageHtml });
      if (path === '/companion.js') return route.fulfill({ contentType: 'text/javascript', body: script });
      if (path === '/companion.css') {
        cssRequests++;
        if (cssRequests === 1) return route.fulfill({ status: 503 });
        if (cssRequests > 2) return route.abort();
        retry.resolve(); await release.promise;
        return route.fulfill({ contentType: 'text/css', body: css });
      }
      return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
    });
    await page.goto('http://companion.test/');
    const launcher = page.locator('#mike-companion .mike-launcher');
    await launcher.waitFor({ state: 'attached' });
    await Promise.race([retry.promise, page.waitForTimeout(6500).then(() => { throw Error('Stylesheet was not retried'); })]);
    assert.equal(await launcher.isVisible(), false);
    await page.evaluate(() => {
      const reader = document.createElement('dialog');
      document.body.append(reader);
      reader.showModal();
    });
    assert.equal(await launcher.isVisible(), false);
    release.resolve();
    await launcher.waitFor();
    const measurements = await page.evaluate(async () => {
      const host = document.querySelector('#mike-companion'), btn = host.shadowRoot.querySelector('.mike-launcher');
      const frames = [];
      async function sample() {
        await new Promise(requestAnimationFrame);
        const box = btn.getBoundingClientRect(), style = getComputedStyle(btn);
        frames.push([box.x, box.y, box.width, box.height, style.position, style.visibility]);
      }
      const reader = document.querySelector('dialog');
      for (let i = 0; i < 3; i++) {
        await sample();
        if (host.parentNode !== reader) throw Error('Launcher is outside the reader');
        reader.close(); reader.remove(); await sample();
        if (host.parentNode !== document.body) throw Error('Launcher was lost with the reader');
        document.body.append(reader); reader.showModal();
      }
      await sample();
      return { frames, width: innerWidth, height: innerHeight };
    });
    for (const frame of measurements.frames) {
      const [x,y,w,h,position,visibility] = frame;
      assert.equal(position, 'fixed'); assert.equal(visibility, 'visible');
      assert(x > measurements.width / 2 && y > measurements.height / 2);
      assert(w >= 44 && w <= 80 && h >= 44 && h <= 100);
      assert.deepEqual(frame, measurements.frames[0]);
    }
    assert.equal(cssRequests, 2, 'Moving a ready launcher must not request its stylesheet again');
    console.log('PASS', mobile ? 'mobile WebKit' : 'desktop Chromium', 'first-load recovery and repeated dialog moves');
  } finally { await browser.close(); }
}

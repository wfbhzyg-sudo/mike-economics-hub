import assert from 'node:assert/strict';
// Run against a loopback test installation with a dedicated student. Playwright is a QA-only dependency.
import { writeFile } from 'node:fs/promises';
const { chromium, webkit, devices } = await import(process.env.PLAYWRIGHT_MODULE_URL || 'playwright');
const browser = (mobile) =>
  (mobile ? webkit : chromium).launch({
    executablePath: process.env[mobile ? 'WEBKIT_EXECUTABLE_PATH' : 'CHROMIUM_EXECUTABLE_PATH']
  });
const device = (mobile) => (mobile ? devices['iPhone 13'] : { viewport: { width: 1440, height: 900 } });
const credentials = {
  username: process.env.QA_STUDENT_USERNAME,
  password: process.env.QA_STUDENT_PASSWORD
};
import { createHash } from 'node:crypto';
const origin = new URL(process.env.QA_PORTAL_ORIGIN).origin,
  checks = [];
assert(
  ['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname),
  'This suite requires an isolated local portal'
);
assert(credentials.username && credentials.password, 'Set QA_STUDENT_USERNAME and QA_STUDENT_PASSWORD');
const pass = (s) => {
  checks.push(s);
  console.log('PASS', s);
};
const signed = async (c) =>
  assert(
    (
      await c.request.post(origin + '/api/portal/login', {
        headers: { Origin: origin },
        data: credentials
      })
    ).ok()
  );
const ready = async (p) => p.locator('body[data-ready="3d"][data-phase=open]').waitFor();
const state = async (p) => p.evaluate(() => [document.body.dataset.spread, document.body.dataset.side]);
async function turns(p, ratio, method, speed) {
  return p.evaluate(
    async ({ ratio, method, speed }) => {
      const desk = document.getElementById('desk'),
        b = document.body;
      const state = () => [b.dataset.spread, b.dataset.side];
      const nap = (n) => new Promise((resolve) => setTimeout(resolve, n));
      function turn(dir) {
        if (method === 'keyboard') {
          document.body.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: dir > 0 ? 'ArrowRight' : 'ArrowLeft',
              bubbles: true,
              cancelable: true
            })
          );
          return;
        }
        const at = (x) => ({ identifier: 7, clientX: x, clientY: 420 }),
          a = at(dir > 0 ? 310 : 70),
          z = at(dir > 0 ? 70 : 310);
        for (const [type, touches, changedTouches] of [
          ['touchstart', [a], []],
          ['touchmove', [z], []],
          ['touchend', [], [z]]
        ]) {
          desk.dispatchEvent(
            Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
              touches,
              changedTouches
            })
          );
        }
      }
      const orig = state();
      turn(1);
      await nap(speed * ratio);
      const active = b.dataset.phase;
      turn(-1);
      for (let i = 0; i < 100 && b.dataset.phase !== 'open'; i++) await nap(25);
      return { orig, active, done: state(), focus: document.activeElement.id };
    },
    { ratio, method, speed }
  );
}
async function guest(b, width, height) {
  const c = await b.newContext({ viewport: { width, height } }),
    p = await c.newPage();
  await p.goto(origin);
  await p.locator('body[data-ready="3d"]').waitFor();
  assert(!['username', 'password'].includes(await p.evaluate(() => document.activeElement.id)));
  const keys = [];
  for (let i = 0; i < 13; i++) {
    await p.keyboard.press('Tab');
    keys.push(await p.evaluate(() => document.activeElement.id || document.activeElement.tagName));
  }
  assert.deepEqual(keys.slice(0, 2), ['username', 'password']);
  for (const id of ['submit', 'lampSpot', 'penSpot']) assert(keys.includes(id), keys);
  if (width === 1440) {
    const username = p.locator('#username'),
      password = p.locator('#password');
    assert.equal(await username.getAttribute('autocomplete'), 'username');
    assert.equal(await password.getAttribute('autocomplete'), 'current-password');
    await username.fill(credentials.username);
    await password.fill(credentials.password);
    await password.press('Enter');
    await ready(p);
    pass('F17 login form Enter submits dedicated student and opens desk; autofill tokens intact');
  }
  await c.close();
  pass(
    'F17 ' +
      width +
      '×' +
      height +
      ' login Tab → username/password; props reachable, no initial autofocus'
  );
}
async function checksDesk(mobile) {
  const b = await browser(mobile);
  try {
    if (!mobile) {
      for (const [w, h] of [
        [1440, 900],
        [844, 390],
        [320, 568]
      ])
        await guest(b, w, h);
    }
    const ctx = await b.newContext(device(mobile));
    await signed(ctx);
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    if (mobile) {
      for (const start of [0, 1]) {
        await p.goto(origin + '/?deskPage=' + start);
        await ready(p);
        for (const method of ['touch', 'keyboard'])
          for (const ratio of [0.2, 0.5, 0.8]) {
            const result = await turns(p, ratio, method, start === 0 ? 490 : 660);
            assert.equal(result.active, start === 0 ? 'shifting' : 'turning', JSON.stringify(result));
            assert.deepEqual(result.orig, result.done, JSON.stringify(result));
            if (method === 'keyboard') assert.equal(result.focus, 'prev');
          }
        pass(
          'F15 mobile WebKit ' +
            (start ? 'spread' : 'half-page') +
            ' touch and keyboard reversals at 20%/50%/80% return to origin'
        );
      }
    } else {
      await p.goto(origin + '/?deskPage=0');
      await ready(p);
      for (const r of [0.2, 0.5, 0.8]) {
        const got = await p.evaluate(async (ratio) => {
          const b = document.body,
            go = (k) =>
              b.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
          go('ArrowRight');
          await new Promise((done) => setTimeout(done, 660 * ratio));
          const active = b.dataset.phase;
          go('ArrowLeft');
          for (let i = 0; i < 100 && b.dataset.phase !== 'open'; i++)
            await new Promise((done) => setTimeout(done, 25));
          return [active, b.dataset.spread, document.activeElement.id];
        }, r);
        assert.deepEqual(got, ['turning', '0', 'prev']);
      }
      pass(
        'F15 Chrome desktop keyboard reversal at 20%/50%/80% returns to spread 0 with previous-corner focus'
      );
      await p.keyboard.press('ArrowRight');
      await p.locator('body[data-spread="1"][data-phase=open]').waitFor();
      await p.keyboard.press('ArrowLeft');
      await p.locator('body[data-spread="0"][data-phase=open]').waitFor();
      pass('F15 trusted keyboard forward/back and committed page numbers');
    }
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.goto(origin + '/?deskPage=0');
    await ready(p);
    const snapshot = await state(p);
    await p.keyboard.press('ArrowRight');
    await ready(p);
    assert.notDeepEqual(await state(p), snapshot);
    await p.keyboard.press('ArrowLeft');
    await ready(p);
    assert.deepEqual(await state(p), snapshot);
    pass(
      'F15 ' +
        (mobile ? 'mobile WebKit' : 'desktop Chrome') +
        ' reduced motion forward and back finish on origin'
    );
    assert.deepEqual(errors, []);
    await ctx.close();
  } finally {
    await b.close();
  }
}
async function companion() {
  const b = await browser(false);
  try {
    const c = await b.newContext(device(false));
    await signed(c);
    const p = await c.newPage();
    let mode = 'ok',
      posts = 0;
    await p.route('**/api/homework/companion?assessment=*', (r) =>
      mode === 'ok'
        ? r.continue()
        : r.fulfill({ status: Number(mode), contentType: 'text/html', body: 'unavailable' })
    );
    await p.route('**/api/homework/companion', async (r) => {
      assert.equal(r.request().method(), 'POST');
      posts++;
      await r.fulfill({ json: { reply: '测试响应', mode: 'learning' } });
    });
    await p.goto(origin + '/?deskPage=0');
    await ready(p);
    const launch = p.locator('.mike-launcher'),
      chat = p.locator('.mike-chat'),
      input = p.locator('.mike-chat textarea'),
      status = p.locator('.mike-chat-status'),
      send = p.locator('.mike-chat button[type=submit]');
    await launch.click();
    await p.waitForFunction(
      () =>
        document.querySelector('#mike-companion').shadowRoot.querySelector('.mike-chat-status')
          .textContent === ''
    );
    await input.fill('测试草稿');
    await p.keyboard.press('Escape');
    await chat.waitFor({ state: 'hidden' });
    mode = '503';
    await launch.click();
    await p.getByRole('button', { name: '重试', exact: true }).waitFor();
    assert((await status.innerText()).includes('草稿已保留'));
    assert(!(await status.innerText()).includes('登录'));
    assert.equal(await input.inputValue(), '测试草稿');
    mode = 'ok';
    await p.getByRole('button', { name: '重试', exact: true }).click();
    await p.waitForFunction(
      () =>
        document.querySelector('#mike-companion').shadowRoot.querySelector('.mike-chat-status')
          .textContent === ''
    );
    await send.click();
    await p.waitForFunction(
      () =>
        document.querySelector('#mike-companion').shadowRoot.querySelector('.mike-chat-status')
          .textContent === '回答完成'
    );
    assert.equal(posts, 1);
    pass('F18 signed student 503 HTML → inline retry retains draft → one submission');
    await p.setViewportSize({ width: 390, height: 844 });
    await p.waitForFunction(() => document.querySelector('#desk').inert);
    assert.equal(await chat.getAttribute('aria-modal'), 'true');
    for (let n = 0; n < 15; n++) {
      await p.keyboard.press('Tab');
      assert(
        await p.evaluate(
          () =>
            !!document.querySelector('#mike-companion').shadowRoot.activeElement?.closest('.mike-chat')
        )
      );
    }
    for (let n = 0; n < 15; n++) {
      await p.keyboard.press('Shift+Tab');
      assert(
        await p.evaluate(
          () =>
            !!document.querySelector('#mike-companion').shadowRoot.activeElement?.closest('.mike-chat')
        )
      );
    }
    await input.fill('断点保留');
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.waitForFunction(() => !document.querySelector('#desk').inert);
    assert.equal(await chat.getAttribute('aria-modal'), null);
    assert.equal(await input.inputValue(), '断点保留');
    await p.keyboard.press('Escape');
    await chat.waitFor({ state: 'hidden' });
    assert(await launch.evaluate((n) => n === n.getRootNode().activeElement));
    pass(
      'F19 1440→390→1440 preserves text; mobile focus wraps in both directions; Esc restores launcher'
    );
    mode = '401';
    await launch.click();
    await p.getByRole('button', { name: '登录', exact: true }).waitFor();
    assert.equal(await p.getByRole('button', { name: '重试', exact: true }).count(), 0);
    pass('F18 401 offers sign-in; expired account history clears');
    await c.close();
  } finally {
    await b.close();
  }
}
async function journal() {
  const b = await browser(true);
  try {
    const c = await b.newContext(device(true));
    await signed(c);
    const p = await c.newPage();
    let mode = 'offline',
      read = 0;
    const edition = {
      id: 'qa-read-only',
      date: '2026-11-20',
      title: '本地验证',
      items: [{ title: '资源更新', text: '本地验收内容' }]
    };
    await p.route('**/api/homework/companion/position', (r) =>
      mode === 'offline'
        ? r.abort('internetdisconnected')
        : mode === '503'
          ? r.fulfill({ status: 503, body: '' })
          : r.fulfill({ json: { csrf: 'qa', profile: { unread: true, editions: [edition] } } })
    );
    await p.route('**/api/homework/companion/profile', (r) => {
      read++;
      return r.fulfill({ json: { profile: { unread: false, editions: [edition] } } });
    });
    await p.goto(origin + '/?deskPage=3');
    await ready(p);
    const source = await state(p),
      tab = p.locator('#news-tab'),
      hash = async () =>
        createHash('sha256')
          .update(await tab.screenshot())
          .digest('hex');
    const before = await hash();
    await tab.click();
    await p.waitForFunction(() => document.querySelector('#news-tab').dataset.loadState === 'error');
    await p.waitForTimeout(160);
    assert.notEqual(await hash(), before);
    assert.equal(await tab.getAttribute('aria-label'), '更新日志未载入，重试');
    assert.deepEqual(await state(p), source);
    assert.equal(read, 0);
    mode = '503';
    await tab.focus();
    await p.keyboard.press('Enter');
    await p.waitForFunction(() => document.querySelector('#news-tab').dataset.loadState === 'error');
    assert.equal(read, 0);
    mode = 'ok';
    const ack = p.waitForResponse(
      (r) => r.url().endsWith('/api/homework/companion/profile') && r.request().method() === 'POST'
    );
    await tab.focus();
    await p.keyboard.press('Enter');
    await ack;
    await p.locator('body[data-phase=open][data-book-section=journal]').waitFor();
    await p.waitForFunction(() => document.querySelector('#news-tab').hasAttribute('data-return'));
    assert.equal(read, 1);
    await tab.click();
    await ready(p);
    assert.deepEqual(await state(p), source);
    pass(
      'F16 disconnected/503 → visible changed bookmark pixels, keyboard retry opens journal; exact right page restored, one read acknowledgement'
    );
    await c.close();
  } finally {
    await b.close();
  }
}
const cmd = process.argv[2] || 'all';
assert(['all', 'guestdesk', 'mobile', 'companion', 'journal'].includes(cmd));

if (cmd === 'all' || cmd === 'guestdesk') await checksDesk(false);
if (cmd === 'all' || cmd === 'mobile') await checksDesk(true);
if (cmd === 'all' || cmd === 'companion') await companion();
if (cmd === 'all' || cmd === 'journal') await journal();
if (process.env.QA_EVIDENCE_PATH)
  await writeFile(
    process.env.QA_EVIDENCE_PATH,
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        environment: 'isolated local portal',
        client: 'Chromium and Playwright WebKit iPhone 13 simulation',
        checks
      },
      null,
      2
    ) + '\n'
  );

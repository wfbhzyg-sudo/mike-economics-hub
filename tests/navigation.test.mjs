import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const motionContext = { window: {} };
vm.runInNewContext(
  readFileSync(new URL("../motion.js", import.meta.url), "utf8"),
  motionContext,
);
globalThis.HubMotion = motionContext.window.HubMotion;
import { setupDock } from "../homework/nav.js";
function fixture({ mobile = false, reduced = false } = {}) {
  const frames = new Map();
  let next = 0,
    time = 0;
  const chosen = [];
  globalThis.matchMedia = (q) => ({
    matches: q.includes("reduced") ? reduced : mobile,
  });
  globalThis.requestAnimationFrame = (fn) => {
    frames.set(++next, fn);
    return next;
  };
  globalThis.cancelAnimationFrame = (id) => frames.delete(id);
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  const paths = [0, 1, 2].map(() => ({
    d: "",
    setAttribute(k, v) {
      this[k] = v;
    },
  }));
  const buttons = [0, 1, 2].map((i) => ({
    dataset: { index: String(i) },
    style: { setProperty() {} },
    setAttribute() {},
    querySelector(q) {
      if (q.includes("path")) return paths[i];
      return {
        getBoundingClientRect: () => ({
          x: mobile ? 80 : 20 + 100 * i,
          y: mobile ? 20 + 70 * i : 60,
          width: 26,
          height: 3,
        }),
      };
    },
  }));
  const transfer = {
      d: "",
      setAttribute(k, v) {
        this[k] = v;
      },
    },
    dot = { style: {}, querySelector: () => transfer },
    element = {
      innerHTML: "",
      querySelectorAll: () => buttons,
      querySelector: () => dot,
      getBoundingClientRect: () => ({ x: 0, y: 0 }),
      setPointerCapture() {},
      hasPointerCapture: () => true,
      releasePointerCapture() {},
    };
  const nav = setupDock(
    element,
    [
      { label: "A", route: "a" },
      { label: "B", route: "b" },
      { label: "C", route: "c" },
    ],
    0,
    (route) => chosen.push(route),
  );
  const step = (n) => {
    for (let i = 0; i < n; i++) {
      time += 1000 / 60;
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((f) => f(time));
    }
  };
  const event = (i, x = 20 + 100 * i, y = 20 + 70 * i) => ({
    button: 0,
    pointerId: 1,
    clientX: x,
    clientY: y,
    target: { closest: () => buttons[i] },
  });
  return { nav, dot, element, step, event, chosen, frames, transfer, paths };
}
test("pointer capture does not swallow a menu click", () => {
  const f = fixture();
  f.element.onpointerdown(f.event(2));
  f.element.onpointerup({ ...f.event(2), target: { closest: () => null } });
  assert.deepEqual(f.chosen, ["c"]);
  f.nav.destroy();
});
test("rapid selection and reversal settle without a stretched residual", () => {
  const f = fixture();
  f.nav.select(2);
  f.step(5);
  f.nav.select(0);
  f.step(4);
  f.nav.select(2);
  f.step(240);
  assert.equal(f.transfer.d, "");
  assert.equal(f.dot.style.opacity, "0");
  assert.equal(f.frames.size, 0);
  f.nav.select(0);
  f.step(240);
  assert.match(f.dot.style.transform, /translate\(-23px,49\.5px\)/);
  f.nav.destroy();
});
test("dragging beyond either endpoint clamps to the last or first entry", () => {
  const f = fixture({ mobile: true });
  f.element.onpointerdown(f.event(0));
  f.element.onpointermove(f.event(2, 80, 999));
  f.element.onpointerup(f.event(2, 80, 999));
  f.step(240);
  assert.deepEqual(f.chosen, ["c"]);
  assert.equal(f.transfer.d, "");
  assert.equal(f.dot.style.opacity, "0");
  f.element.onpointerdown(f.event(2));
  f.element.onpointermove(f.event(0, 80, -50));
  f.element.onpointerup(f.event(0, 80, -50));
  f.step(240);
  assert.deepEqual(f.chosen, ["c", "a"]);
  f.nav.destroy();
});
test("reduced motion selects directly without scheduling animation frames", () => {
  const f = fixture({ reduced: true });
  f.nav.select(2);
  assert.equal(f.frames.size, 0);
  assert.match(f.dot.style.transform, /translate\(177px,49\.5px\)/);
  assert.equal(f.transfer.d, "");
  f.nav.destroy();
});

test("moving selection draws a connecting neck, then merges at rest", () => {
  const f = fixture();
  f.nav.select(2);
  f.step(4);
  assert.ok(f.transfer.d.includes(" C "));
  assert.ok(Number(f.dot.style.opacity) > 0);
  f.step(240);
  assert.equal(f.transfer.d, "");
  f.nav.destroy();
});

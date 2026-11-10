export function setupDock(element, items, selected, onSelect) {
  const { indicatorStep, influence, liquidState, liquidLine, liquidTransfer } =
    globalThis.HubMotion;
  element.innerHTML =
    items
      .map(
        (item, i) =>
          `<button class="dock-item" data-index="${i}" aria-current="${i === selected ? "page" : "false"}"><span class="label">${item.label}</span><span class="guide" aria-hidden="true"><svg viewBox="-22 -18 44 36"><path fill="currentColor"/></svg></span></button>`,
      )
      .join("") +
    '<span class="liquid-dot" aria-hidden="true"><svg viewBox="-56 -12 112 24"><path fill="currentColor"/></svg></span>';
  const buttons = [...element.querySelectorAll("button")],
    dot = element.querySelector(".liquid-dot"),
    transferPath = dot.querySelector("path"),
    guidePaths = buttons.map((b) => b.querySelector(".guide path")),
    reduced = matchMedia("(prefers-reduced-motion: reduce)"),
    mobile = matchMedia("(max-width:640px)");
  let position = selected,
    velocity = 0,
    target = selected,
    frame,
    last = 0,
    drag = false,
    start = 0,
    moved = false,
    closed = false,
    pressedIndex = null;
  const coords = () => {
    const base = element.getBoundingClientRect();
    return buttons.map((b) => {
      const g = b.querySelector(".guide").getBoundingClientRect();
      return { x: g.x + g.width / 2 - base.x, y: g.y + g.height / 2 - base.y };
    });
  };
  function draw() {
    const points = coords();
    if (!points.length) return;
    const scale = mobile.matches ? 0.75 : 1;
    const spacing =
      points.length > 1
        ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
        : 1;
    const flow = liquidState(
      position,
      velocity,
      items.length - 1,
      spacing / scale,
    );
    const p = points[flow.lo],
      q = points[flow.hi];
    const x = p.x + (q.x - p.x) * flow.fraction,
      y = p.y + (q.y - p.y) * flow.fraction;
    const visible = !reduced.matches && flow.visible;
    transferPath.setAttribute(
      "d",
      visible ? liquidTransfer(flow.tail, flow.strain) : "",
    );
    dot.style.opacity = visible ? String(flow.opacity) : "0";
    dot.style.transform = `translate(${x - 56}px,${y - 12}px) rotate(${mobile.matches ? (flow.direction > 0 ? 90 : -90) : flow.direction > 0 ? 0 : 180}deg) scale(${scale})`;
    buttons.forEach((b, i) => {
      const proximity = influence(position - i);
      guidePaths[i].setAttribute(
        "d",
        liquidLine(position - i, flow.strain, mobile.matches, flow.direction),
      );
      b.style.setProperty("--scale", String(0.92 + 0.26 * proximity));
      b.style.setProperty(
        "--label-color",
        `rgb(${Math.round(166 - 36 * proximity)} ${Math.round(173 + 9 * proximity)} ${Math.round(183 + 47 * proximity)})`,
      );
    });
  }
  function tick(time) {
    if (closed) return;
    const dt = Math.min(40, time - (last || time));
    last = time;
    const next = indicatorStep(
      { position, velocity },
      target,
      dt,
      items.length - 1,
    );
    position = next.position;
    velocity = next.velocity;
    draw();
    if (next.settled) {
      frame = null;
      last = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  function move(value) {
    target = Math.max(0, Math.min(items.length - 1, value));
    if (reduced.matches) {
      position = target;
      velocity = 0;
      draw();
      return;
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }
  const indexAt = (e) => {
    const base = element.getBoundingClientRect(),
      value = mobile.matches ? e.clientY - base.y : e.clientX - base.x,
      points = coords().map((p) => (mobile.matches ? p.y : p.x));
    if (value <= points[0]) return 0;
    if (value >= points.at(-1)) return points.length - 1;
    const i = points.findIndex(
      (p, j) => j < points.length - 1 && value >= p && value <= points[j + 1],
    );
    return i + (value - points[i]) / (points[i + 1] - points[i]);
  };
  element.onpointerdown = (e) => {
    if (e.button !== 0) return;
    drag = true;
    moved = false;
    pressedIndex = e.target.closest("button")?.dataset.index;
    start = mobile.matches ? e.clientY : e.clientX;
    element.setPointerCapture(e.pointerId);
  };
  element.onpointermove = (e) => {
    if (!drag) return;
    if (Math.abs((mobile.matches ? e.clientY : e.clientX) - start) > 5)
      moved = true;
    if (moved) move(indexAt(e));
  };
  element.onpointerup = (e) => {
    if (!drag) return;
    drag = false;
    const i = moved ? Math.round(indexAt(e)) : Number(pressedIndex);
    if (Number.isFinite(i)) {
      move(i);
      onSelect(items[i].route, i);
    }
    if (element.hasPointerCapture(e.pointerId))
      element.releasePointerCapture(e.pointerId);
  };
  element.onpointercancel = () => {
    drag = false;
    move(selected);
  };
  element.onclick = (e) => {
    if (e.detail === 0) {
      const i = Number(e.target.closest("button")?.dataset.index);
      if (Number.isFinite(i)) {
        move(i);
        onSelect(items[i].route, i);
      }
    }
  };
  const observer = new ResizeObserver(draw);
  observer.observe(element);
  draw();
  return {
    select(i) {
      selected = i;
      move(i);
      buttons.forEach((b, j) =>
        b.setAttribute("aria-current", j === i ? "page" : "false"),
      );
    },
    destroy() {
      closed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.onpointerdown =
        element.onpointermove =
        element.onpointerup =
        element.onpointercancel =
        element.onclick =
          null;
    },
  };
}

// Keep contextual menus visible inside narrow and independently scrolling readers.
export function menuPlacement(anchor, size, viewport) {
  const gap = 6, edge = 8;
  const leftEdge = viewport.left || 0, topEdge = viewport.top || 0;
  const width = Math.min(size.width, viewport.width - edge * 2);
  const below = topEdge + viewport.height - anchor.bottom - gap - edge;
  const above = anchor.top - topEdge - gap - edge;
  const upward = below < Math.min(size.height, 160) && above > below;
  const maxHeight = Math.max(44, upward ? above : below);
  return {left: Math.max(leftEdge + edge, Math.min(anchor.right - width, leftEdge + viewport.width - width - edge)),
    top: upward ? Math.max(topEdge + edge, anchor.top - gap - Math.min(size.height, maxHeight)) : anchor.bottom + gap,
    width, maxHeight};
}

export function bindDisclosureMenus(root, selector) {
  const events = new AbortController();
  const entries = [...root.querySelectorAll(selector)].map(details => ({details,
    trigger: details.querySelector(':scope > summary'), panel: details.querySelector(':scope > div')}))
    .filter(entry => entry.trigger && entry.panel);
  let active;
  const place = entry => {
    const {panel, trigger} = entry, viewport = window.visualViewport;
    const p = menuPlacement(trigger.getBoundingClientRect(), {width: panel.classList.contains('lib-page-popover') ? 300 : 240, height: panel.scrollHeight},
      {left: viewport?.offsetLeft || 0, top: viewport?.offsetTop || 0, width: viewport?.width || innerWidth, height: viewport?.height || innerHeight});
    Object.assign(panel.style, {position:'fixed', inset:'auto', margin:'0', left:p.left+'px', top:p.top+'px', width:p.width+'px', maxHeight:p.maxHeight+'px', overflowY:'auto', zIndex:'150'});
  };
  function close(entry, restore = false) {
    if (!entry) return;
    entry.details.open = false;
    if (entry.panel.hidePopover && entry.panel.matches(':popover-open')) entry.panel.hidePopover();
    entry.panel.style.cssText = entry.originalStyle;
    if (active === entry) active = null;
    if (restore && entry.trigger.isConnected) entry.trigger.focus({preventScroll:true});
  }
  for (const entry of entries) {
    entry.originalStyle = entry.panel.style.cssText;
    if (typeof entry.panel.showPopover === 'function') entry.panel.setAttribute('popover', 'manual');
    entry.details.addEventListener('toggle', () => {
      if (!entry.details.open) { close(entry); return; }
      if (active && active !== entry) close(active);
      active = entry;
      if (entry.panel.showPopover && !entry.panel.matches(':popover-open')) entry.panel.showPopover();
      place(entry);
    }, {signal:events.signal});
  }
  document.addEventListener('pointerdown', e => {if (active && !active.details.contains(e.target)) close(active);}, {capture:true,signal:events.signal});
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape' && active) {e.preventDefault(); e.stopPropagation(); close(active, true);}
  }, {capture:true,signal:events.signal});
  document.addEventListener('scroll', e => {if (active && !active.panel.contains(e.target)) place(active);}, {capture:true,passive:true,signal:events.signal});
  window.addEventListener('resize', () => {if(active) place(active);}, {signal:events.signal});
  window.visualViewport?.addEventListener('resize', () => {if(active) place(active);}, {signal:events.signal});
  return () => {events.abort(); for (const entry of entries) {close(entry); entry.panel.removeAttribute('popover');}};
}

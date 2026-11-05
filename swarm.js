// =========================================================
//  Swarm rebuild — wipes the page, then a swarm of named
//  multiplayer-style cursors rebuilds it live: boxes are
//  dragged out with a size badge, text is typed with a caret.
//  Start: footer button, Alt+Shift+S, or ?swarm in the URL.
//  Esc, Alt+Shift+S again, or a click/tap returns to the real page.
//  Plain JS, no libraries.
// =========================================================
(() => {
  "use strict";
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const COLORS = ["#ff8a3d", "#f17fa8", "#6ec1ff", "#8ee3a1", "#b58cff", "#ffc65c", "#ff6b6b", "#4dd4c8"];
  const NAMES = ["ana", "kai", "mira", "jo", "sol", "pip", "nia", "ren"];
  const MAX_AGENTS = 8;

  // what gets rebuilt, and how: "box" = dragged out, "text" = typed
  const ITEMS = [
    [".hero", "box"], [".hero-grid", "box"], [".clouds", "box"], [".hills", "box"],
    [".nav", "box"], [".nav nav a", "box"], [".theme-toggle", "box"],
    [".hero-photo", "box"], [".eyebrow", "text"], [".title", "box"], [".tagline", "box"],
    [".socials", "box"], [".socials a", "box"],
    [".section-title", "text"], [".about-text p", "text"], [".stat", "box"], [".skills span", "box"],
    ["section > .muted", "text"], [".repo", "box"], [".more-link", "text"], [".toy", "box"],
    [".contact .big", "text"], [".hero-cta .btn", "box"],
    ["footer", "box"], [".footer > span", "text"], [".swarm-btn", "box"],
  ];

  const S = { active: false, done: false, speed: 1.5, vel: 0 };
  let items = [], agents = [], decors = new Set(), layer, raf, lastT, lastY, lastScrollT;
  let mouse = { x: innerWidth / 2, y: innerHeight / 2 };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const frame = () => new Promise((r) => requestAnimationFrame(r));
  const el$ = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };

  // ---------- cursors ----------
  function spawnAgent() {
    const i = agents.length;
    const color = COLORS[i % COLORS.length];
    const node = el$("div", "sw-cursor", layer);
    node.style.color = color;
    node.innerHTML = '<svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true"><path d="M1.5 1.5v14l3.8-3.6 2.9 6.6 2.8-1.2-2.9-6.5h5.2z" fill="currentColor" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>';
    const tag = el$("span", "sw-tag", node);
    tag.textContent = NAMES[i % NAMES.length];
    tag.style.background = color;
    const a = {
      i, color, node, alive: true, wait: null, rate: 7,
      x: Math.random() * innerWidth, y: -50, dist: 999,
      orbit: Math.random() * 6.28,
      target: () => ({ x: innerWidth / 2 + (i - 2) * 40, y: 90 }),
    };
    agents.push(a);
    run(a);
    return a;
  }

  function stepAgent(a, dt) {
    const t = a.target();
    const tx = clamp(t.x, 6, innerWidth - 6), ty = clamp(t.y, 6, innerHeight - 6);
    const k = 1 - Math.exp(-a.rate * S.speed * dt);
    a.x += (tx - a.x) * k;
    a.y += (ty - a.y) * k;
    a.dist = Math.hypot(tx - a.x, ty - a.y);
    a.node.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px)`;
    if (a.wait && a.dist < a.wait.thr) { clearTimeout(a.wait.tm); const r = a.wait.res; a.wait = null; r(); }
  }

  const near = (a, thr, maxMs) => new Promise((res) => {
    a.wait = { thr, res, tm: setTimeout(() => { a.wait = null; res(); }, maxMs) };
  });

  // ---------- items ----------
  function collect() {
    const seen = new Set(), list = [];
    ITEMS.forEach(([sel, type]) => document.querySelectorAll(sel).forEach((el) => {
      if (seen.has(el)) return;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      seen.add(el);
      list.push({ el, type, top: r.top + scrollY, claimed: false, done: false });
    }));
    list.forEach((it, n) => { it.n = n; it.bucket = Math.round(it.top / 24); });
    list.sort((a, b) => a.bucket - b.bucket || (a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1));
    return list;
  }

  function prepText(it) {
    if (it.chars) return;
    it.orig = it.el.innerHTML;
    it.chars = [];
    const walker = document.createTreeWalker(it.el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach((ch) => {
        if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); return; }
        const s = el$("span", "sw-ch sw-off");
        s.textContent = ch;
        it.chars.push(s);
        frag.appendChild(s);
      });
      node.replaceWith(frag);
    });
  }

  const hide = (it) => { it.el.classList.remove("sw-done"); it.el.classList.add("sw-hide"); };
  function show(it, fade) {
    it.el.classList.remove("sw-hide");
    it.el.classList.add("sw-done");
    if (fade && it.el.animate) it.el.animate({ opacity: [0, 1] }, { duration: 260, easing: "ease-out" });
  }

  const inView = (it) => {
    const r = it.el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  };
  const pending = () => items.filter((it) => !it.claimed && inView(it));

  // ---------- decorations that follow the page ----------
  function badge(parent, color, text) {
    const b = el$("span", "sw-badge", parent);
    b.style.background = color;
    if (text) b.textContent = text;
    return b;
  }

  async function dragBox(a, it) {
    const ghost = el$("div", "sw-ghost", layer);
    ghost.style.borderColor = a.color;
    ghost.style.background = a.color + "14";
    const size = badge(ghost, a.color);
    const r0 = it.el.getBoundingClientRect();
    const area = r0.width * r0.height;
    const dur = (area < 6000 ? 240 : clamp(260 + area / 1800, 320, 950)) / S.speed;
    const t0 = performance.now();
    let e = 0;
    const upd = () => {
      const r = it.el.getBoundingClientRect();
      e = ease(clamp((performance.now() - t0) / dur, 0, 1));
      const w = r.width * e, h = r.height * e;
      const st = ghost.style;
      st.left = r.left + "px"; st.top = r.top + "px"; st.width = w + "px"; st.height = h + "px";
      size.textContent = `${Math.round(w)} × ${Math.round(h)}`;
    };
    decors.add(upd);
    a.rate = 16;
    a.target = () => { const r = it.el.getBoundingClientRect(); return { x: r.left + r.width * e, y: r.top + r.height * e }; };
    await wait(dur + 30);
    decors.delete(upd);
    show(it, true);
    ghost.style.transition = "opacity .3s";
    ghost.style.opacity = "0";
    setTimeout(() => ghost.remove(), 320);
  }

  async function typeText(a, it) {
    prepText(it);
    show(it, false);
    const chars = it.chars, n = chars.length;
    const r0 = it.el.getBoundingClientRect();

    // a pink guide dragged in above wide text, like a design tool
    let guide, guideUpd;
    if (r0.width > 240) {
      guide = el$("div", "sw-guide", layer);
      const gl = badge(guide, "#f24e1e");
      guideUpd = () => {
        const r = it.el.getBoundingClientRect();
        guide.style.top = r.top - 4 + "px";
        gl.textContent = "Y " + Math.round(r.top + scrollY);
      };
      decors.add(guideUpd);
    }

    const caret = el$("div", "sw-caret", layer);
    caret.style.background = a.color;
    let typed = 0;
    const caretPos = () => {
      if (typed > 0) { const r = chars[typed - 1].getBoundingClientRect(); return { x: r.right, y: r.top, h: r.height }; }
      const r = (chars[0] || it.el).getBoundingClientRect();
      return { x: r.left, y: r.top, h: r.height };
    };
    const upd = () => {
      const c = caretPos(), st = caret.style;
      st.left = c.x + "px"; st.top = c.y + "px"; st.height = c.h + "px";
    };
    decors.add(upd);
    a.rate = 15;
    a.target = () => { const c = caretPos(); return { x: c.x + 4, y: c.y + c.h * 0.8 }; };

    const per = clamp(1700 / Math.max(n, 1), 5, 30) / S.speed;
    const t0 = performance.now();
    while (typed < n && S.active) {
      await frame();
      const upTo = Math.min(n, Math.floor((performance.now() - t0) / per) + 1);
      while (typed < upTo) chars[typed++].classList.remove("sw-off");
    }
    chars.forEach((c) => c.classList.remove("sw-off"));
    await wait(120 / S.speed);
    decors.delete(upd);
    caret.remove();
    if (guide) { decors.delete(guideUpd); guide.remove(); }
  }

  async function build(a, it) {
    a.rate = 8;
    a.target = () => { const r = it.el.getBoundingClientRect(); return { x: r.left, y: r.top }; };
    await near(a, 18, 1700 / S.speed);
    if (!S.active) return;
    if (it.type === "text") await typeText(a, it); else await dragBox(a, it);
    it.done = true;
    if (items.every((x) => x.done)) finish();
  }

  async function run(a) {
    while (S.active && a.alive) {
      const it = pending()[0];
      if (!it) {
        a.busy = false;
        a.rate = 3;
        a.target = () => {
          const t = performance.now() / 1000;
          const ang = a.orbit + t * 0.6;
          const base = S.done ? mouse : { x: innerWidth / 2, y: innerHeight * 0.55 };
          return { x: base.x + Math.cos(ang) * (S.done ? 46 : 160) + (a.i - 3) * 14, y: base.y + Math.sin(ang * 1.3) * (S.done ? 38 : 90) };
        };
        await wait(180);
        continue;
      }
      it.claimed = true;
      a.busy = true;
      try { await build(a, it); } catch (err) { console.warn("swarm", err); it.done = true; show(it, false); }
    }
  }

  // ---------- main loop ----------
  function loop(t) {
    if (!S.active) return;
    const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
    lastT = t;
    S.vel *= Math.exp(-dt * 2.2);
    const want = clamp(3 + Math.floor(S.vel / 900), 3, MAX_AGENTS);
    if (agents.length < want) spawnAgent();
    decors.forEach((fn) => fn());
    agents.forEach((a) => stepAgent(a, dt));
    raf = requestAnimationFrame(loop);
  }

  function onScroll() {
    const now = performance.now();
    if (lastScrollT) S.vel = S.vel * 0.6 + (Math.abs(scrollY - lastY) / Math.max(1, now - lastScrollT)) * 1000 * 0.4;
    lastY = scrollY; lastScrollT = now;
  }
  const onMove = (e) => { mouse = { x: e.clientX, y: e.clientY }; };

  function finish() { S.done = true; }

  function resetItems() {
    items.forEach((it) => {
      if (it.orig != null) { it.el.innerHTML = it.orig; it.orig = null; it.chars = null; }
      it.el.classList.remove("sw-done", "sw-hide");
    });
  }

  function begin() {
    items = collect();
    items.forEach(hide);
    S.done = false;
    for (let i = 0; i < 3; i++) spawnAgent();
  }

  async function start() {
    if (S.active || reduce) return;
    S.active = true;
    S.done = false;
    S.vel = 0;
    // the real page is no longer interactive-visible while we rebuild it
    document.querySelectorAll(".reveal").forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
    layer = el$("div", "sw-layer", document.body);
    root.classList.add("sw-fade");
    await wait(620);
    if (!S.active) return;
    root.classList.add("swarm");
    root.classList.remove("sw-fade");
    lastY = scrollY; lastScrollT = 0; lastT = 0;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    begin();
    raf = requestAnimationFrame(loop);
  }

  function clearActors() {
    agents.forEach((a) => { a.alive = false; clearTimeout(a.wait && a.wait.tm); });
    agents = [];
    decors.clear();
    if (layer) layer.innerHTML = "";
  }

  function stop() {
    if (!S.active) return;
    S.active = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("mousemove", onMove);
    clearActors();
    resetItems();
    root.classList.remove("swarm", "sw-fade");
    layer && layer.remove();
    items = [];
  }

  // ---------- entry points ----------
  const btn = document.querySelector(".swarm-btn");
  if (btn) {
    if (reduce) btn.hidden = true;
    btn.addEventListener("click", start);
  }
  document.addEventListener("click", (e) => {
    if (!S.active) return;
    e.preventDefault(); e.stopPropagation();
    stop();
  }, true);
  window.addEventListener("keydown", (e) => {
    if (e.code === "KeyS" && e.altKey && e.shiftKey) { e.preventDefault(); S.active ? stop() : start(); }
    else if (e.key === "Escape" && S.active) stop();
  });
  if (/[?&]swarm\b/.test(location.search)) window.addEventListener("load", () => setTimeout(start, 1500));
  window.swarmRebuild = { start, stop, state: S };
})();

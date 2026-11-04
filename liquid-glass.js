// =========================================================
//  mqz portfolio — Liquid Glass lighting (Apple devices)
//
//  The glass look itself is CSS (see "Liquid Glass" in style.css) and
//  is switched on by the script in <head>. This file only moves the
//  highlight on the glass controls to wherever your cursor or finger is.
//  Uses event delegation, so project-card buttons that are rendered
//  later get it too.
// =========================================================
(function () {
  if (!document.documentElement.classList.contains("liquid")) return;

  const GLASS = ".nav, .nav nav a, .socials, .socials a, .theme-toggle, .btn.ghost";
  let lit = new Set(); // glass elements currently lit

  // the glass element under the pointer plus any glass it sits inside (a link inside the nav, say)
  function glassChain(target) {
    const chain = [];
    for (let el = target.closest && target.closest(GLASS); el; el = el.parentElement && el.parentElement.closest(GLASS)) chain.push(el);
    return chain;
  }

  function light(e, level) {
    const chain = glassChain(e.target);
    lit.forEach((el) => {
      if (!chain.includes(el)) { el.style.setProperty("--hl", 0); lit.delete(el); }
    });
    chain.forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
      el.style.setProperty("--hl", level);
      lit.add(el);
    });
  }
  function clear() {
    lit.forEach((el) => el.style.setProperty("--hl", 0));
    lit.clear();
  }

  document.addEventListener("pointermove", (e) => light(e, e.buttons ? 1.6 : 1), { passive: true });
  document.addEventListener("pointerdown", (e) => light(e, 1.6), { passive: true });
  // a finger lifting leaves nothing to hover, a mouse is still over the control
  document.addEventListener("pointerup", (e) => (e.pointerType === "mouse" ? light(e, 1) : clear()), { passive: true });
  document.addEventListener("pointercancel", clear, { passive: true });
  document.addEventListener("pointerout", (e) => { if (!e.relatedTarget) clear(); }, { passive: true });
})();

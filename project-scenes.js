// =========================================================
//  mqz portfolio — animated project thumbnails (GSAP)
//
//  Each project card gets a small looping SVG scene that shows
//  what the project does, instead of a generic gradient banner.
//  The markup below is a complete still on its own, so the cards
//  look right even if GSAP fails to load or motion is reduced.
// =========================================================
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INK = "#f6efe6", MUTED = "#9a93a8";

  // ---------- 1. Claude Checkpoint Manager: checkpoints on a timeline, then a rewind ----------
  const ccmNodes = [0, 1, 2, 3, 4].map((i) => {
    const x = 60 + i * 70;
    return `
    <g class="ccm-node${i >= 3 ? " late" : ""}" transform="translate(${x} 0)">
      <line class="ccm-tick" x1="0" y1="103" x2="0" y2="123" stroke="#9b7bff" stroke-opacity=".5" stroke-width="2"/>
      <rect class="ccm-ctx" x="-10" y="85" width="20" height="16" rx="3" fill="none" stroke="#9b7bff" stroke-width="2"/>
      <circle class="ccm-dot" cx="0" cy="131.5" r="8" fill="#9b7bff"/>
      <text class="ccm-lbl" x="0" y="164" text-anchor="middle" font-size="12" fill="${MUTED}">#${i + 1}</text>
    </g>`;
  }).join("");

  // ---------- 4. RBLXRacer: two cars lapping a track ----------
  const TRACK = "M110 70 H290 A50 50 0 0 1 290 170 H110 A50 50 0 0 1 110 70 Z";
  const car = (cls, fill, pos) => `
    <g class="rc-car ${cls}" transform="${pos}">
      <rect x="-10" y="-6" width="20" height="12" rx="3.5" fill="${fill}"/>
      <rect x="1" y="-4.5" width="5.5" height="9" rx="1.5" fill="#14121d" fill-opacity=".55"/>
    </g>`;

  const SCENES = {
    ccm: `
<svg class="scene" viewBox="0 0 400 240" aria-hidden="true">
  <rect class="ccm-line" x="50" y="130" width="300" height="3" rx="1.5" fill="#9b7bff" fill-opacity=".35"/>
  ${ccmNodes}
  <circle class="ccm-head" cx="340" cy="131.5" r="15" fill="none" stroke="${INK}" stroke-width="2"/>
  <text class="ccm-cap1" x="200" y="212" text-anchor="middle" font-size="12" fill="${MUTED}">code + context, saved together</text>
  <text class="ccm-cap2" x="200" y="212" text-anchor="middle" font-size="12" fill="${INK}" opacity="0">rolled back to #3</text>
</svg>`,

    tidypaste: `
<svg class="scene" viewBox="0 0 400 240" aria-hidden="true">
  <text class="tp-junk" x="108" y="137" font-size="17" fill="${MUTED}" opacity="0">?utm_source=tw</text>
  <text class="tp-junk" x="108" y="164" font-size="17" fill="${MUTED}" opacity="0">&amp;utm_medium=social</text>
  <text class="tp-junk" x="108" y="191" font-size="17" fill="${MUTED}" opacity="0">&amp;fbclid=IwAR3x9</text>
  <rect class="tp-strike" x="108" y="131" width="143" height="2" fill="#ff5e5b" opacity="0"/>
  <rect class="tp-strike" x="108" y="158" width="184" height="2" fill="#ff5e5b" opacity="0"/>
  <rect class="tp-strike" x="108" y="185" width="153" height="2" fill="#ff5e5b" opacity="0"/>
  <text class="tp-base" x="108" y="110" font-size="17" fill="${INK}">example.com/post</text>
  <g class="tp-pill">
    <rect x="150" y="146" width="100" height="26" rx="13" fill="#ffc65c"/>
    <text x="200" y="163.5" text-anchor="middle" font-size="12" font-weight="600" fill="#14121d">copied</text>
  </g>
</svg>`,

    termux: `
<svg class="scene" viewBox="0 0 400 240" aria-hidden="true">
  <rect x="40" y="50" width="320" height="140" rx="10" fill="#0c0b13" stroke="#2c2939" stroke-width="2"/>
  <text class="tx-line" x="62" y="88" font-size="13"><tspan fill="#5ce1e6">~ $</tspan><tspan class="tx-cmd" dx="7.8" fill="${INK}">pkg update</tspan></text>
  <text class="tx-line" x="62" y="114" font-size="13"><tspan fill="#5ce1e6">~ $</tspan><tspan class="tx-cmd" dx="7.8" fill="${INK}">pkg install python</tspan></text>
  <text class="tx-line" x="62" y="140" font-size="13"><tspan fill="#5ce1e6">~ $</tspan><tspan class="tx-cmd" dx="7.8" fill="${INK}">ls</tspan></text>
  <text class="tx-line tx-out" x="62" y="166" font-size="13" fill="${MUTED}">projects&#160;&#160;storage&#160;&#160;notes.txt</text>
  <rect class="tx-cur" x="108.8" y="128" width="8" height="15" fill="#5ce1e6"/>
</svg>`,

    racer: `
<svg class="scene" viewBox="0 0 400 240" aria-hidden="true">
  <path class="rc-path" d="${TRACK}" fill="none" stroke="#2c2939" stroke-width="30"/>
  <path d="${TRACK}" fill="none" stroke="#4a4560" stroke-width="2" stroke-dasharray="8 10"/>
  <rect x="204" y="55" width="4" height="30" fill="${INK}"/>
  ${car("rc-car1", "#ff5e5b", "translate(250 70) rotate(0)")}
  ${car("rc-car2", "#ffc65c", "translate(150 170) rotate(180)")}
</svg>`,
  };
  window.PROJECT_SCENES = SCENES;

  // ---------- animation builders: each returns the tweens/timelines it created ----------
  const builders = {
    ccm(thumb) {
      const q = gsap.utils.selector(thumb);
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
      tl.fromTo(q(".ccm-line"), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.7, ease: "power2.out" })
        .fromTo(q(".ccm-dot"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.15 }, "-=0.3")
        .fromTo(q(".ccm-ctx, .ccm-tick"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.075 }, "<0.1")
        .fromTo(q(".ccm-lbl"), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.15 }, "<")
        .fromTo(q(".ccm-head"), { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ">-0.1")
        .fromTo(q(".ccm-cap1"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, "<")
        .addLabel("poster")
        // rollback: the marker rewinds to #3 and the newer checkpoints dim
        .to(q(".ccm-head"), { x: -140, duration: 0.9, ease: "power2.inOut" }, "+=0.9")
        .to(q(".ccm-node.late"), { opacity: 0.25, duration: 0.4 }, "<0.45")
        .to(q(".ccm-cap1"), { opacity: 0, duration: 0.25 }, "<")
        .to(q(".ccm-cap2"), { opacity: 1, duration: 0.3 }, ">-0.1")
        .to({}, { duration: 1.3 });
      if (reduce) tl.pause().seek("poster");
      return [tl];
    },

    tidypaste(thumb) {
      const q = gsap.utils.selector(thumb);
      const junk = q(".tp-junk"), strikes = q(".tp-strike");
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      tl.fromTo(q(".tp-base"), { opacity: 0, y: -27 }, { opacity: 1, y: -27, duration: 0.3 })
        .fromTo(junk, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.12 })
        .fromTo(strikes, { opacity: 0, scaleX: 0, transformOrigin: "0% 50%" }, { opacity: 1, scaleX: 1, duration: 0.35, stagger: 0.2, ease: "power2.inOut" }, "+=0.5")
        .to([...junk, ...strikes], { opacity: 0, x: 30, duration: 0.4, stagger: 0.04, ease: "power2.in" }, "+=0.15")
        .to(q(".tp-base"), { y: 0, duration: 0.5, ease: "power3.inOut" }, "-=0.1")
        .fromTo(q(".tp-pill"), { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" })
        .addLabel("poster")
        .to({}, { duration: 1.6 });
      if (reduce) tl.pause().seek("poster");
      return [tl];
    },

    termux(thumb) {
      const q = gsap.utils.selector(thumb);
      const cur = q(".tx-cur")[0];
      const ADV = 13 * 0.6; // character width of the monospace font
      const lines = q(".tx-line");
      const typed = [...q(".tx-cmd")].map((el, i) => ({ el, str: el.textContent, line: lines[i], y: +lines[i].getAttribute("y") }));
      const clear = () => typed.forEach((t) => (t.el.textContent = ""));
      clear();

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4, onRepeat: clear });
      typed.forEach((t, i) => {
        const o = { n: 0 };
        tl.fromTo(t.line, { opacity: 0 }, { opacity: 1, duration: 0.05 }, i ? "+=0.35" : 0)
          .to(o, {
            n: t.str.length, duration: t.str.length * 0.07, ease: "none",
            onUpdate: () => {
              const n = Math.round(o.n);
              t.el.textContent = t.str.slice(0, n);
              cur.setAttribute("x", 62 + (4 + n) * ADV);
              cur.setAttribute("y", t.y - 12);
            },
          });
      });
      tl.fromTo(q(".tx-out"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, "+=0.2")
        .addLabel("poster")
        .to({}, { duration: 1.2 });

      if (reduce) { tl.pause().seek("poster"); return [tl]; }
      const blink = gsap.to(cur, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });
      return [tl, blink];
    },

    racer(thumb) {
      if (reduce) return []; // the still in the markup is used as is
      const path = thumb.querySelector(".rc-path");
      const len = path.getTotalLength();
      const place = (el, p) => {
        const a = path.getPointAtLength((p % 1) * len);
        const b = path.getPointAtLength(((p + 0.004) % 1) * len);
        const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        el.setAttribute("transform", `translate(${a.x} ${a.y}) rotate(${deg})`);
      };
      return [[".rc-car1", 3.4, 0.25], [".rc-car2", 4.1, 0.75]].map(([sel, dur, start]) => {
        const el = thumb.querySelector(sel);
        const o = { p: start };
        place(el, start);
        return gsap.to(o, { p: start + 1, duration: dur, ease: "none", repeat: -1, onUpdate: () => place(el, o.p) });
      });
    },
  };

  // ---------- mount: (re)start the scenes for whatever cards are on the page ----------
  let live = [];
  window.mountScenes = function () {
    live.forEach((l) => { l.anims.forEach((a) => a.kill()); if (l.io) l.io.disconnect(); });
    live = [];
    if (!window.gsap) return; // the still markup is already in place

    document.querySelectorAll(".repo-thumb[data-scene]").forEach((thumb) => {
      const build = builders[thumb.dataset.scene];
      if (!build) return;
      const anims = build(thumb);
      let io = null;
      if (!reduce) {
        // only run a scene while its card is on screen
        anims.forEach((a) => a.pause());
        io = new IntersectionObserver(([e]) => anims.forEach((a) => (e.isIntersecting ? a.play() : a.pause())), { threshold: 0.1 });
        io.observe(thumb);
      }
      live.push({ anims, io });
    });
  };
})();

// =========================================================
//  mqz portfolio — all animations use anime.js (v3)
// =========================================================
const GITHUB_USER = "mqz0211";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const palette = ["#ff8a3d", "#ffc65c", "#f17fa8", "#9b7bff", "#ff5e5b"]; // sunset colours

// ---------- 1. Theme toggle (saved in localStorage) ----------
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch (e) {}
document.querySelector(".theme-toggle").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------- 2. Custom cursor ----------
const cursor = document.querySelector(".cursor");
window.addEventListener("mousemove", (e) => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  cursor.classList.add("on");
});
document.addEventListener("mouseover", (e) => {
  cursor.classList.toggle("big", !!e.target.closest("a, button"));
});

// ---------- 3. Hero title: split letters and animate in ----------
function splitChars(el) {
  // wraps every character of text nodes in <span class="char">, keeps child elements
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "char";
        s.textContent = ch;
        frag.appendChild(s);
      });
      node.replaceWith(frag);
    } else if (!node.classList.contains("scramble") && !node.classList.contains("hl")) {
      splitChars(node);
    }
  });
}
document.querySelectorAll(".title .line").forEach(splitChars);

anime.timeline({ easing: "easeOutExpo" })
  .add({
    targets: ".title .char, .title .hl",
    translateY: [80, 0],
    rotate: [12, 0],
    opacity: [0, 1],
    duration: 1100,
    delay: anime.stagger(30),
  })
  .add({ targets: ".eyebrow, .tagline, .socials", opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(120) }, "-=800")
  .add({ targets: ".squiggle path", strokeDashoffset: [anime.setDashoffset, 0], duration: 1000, easing: "easeInOutSine" }, "-=600")
  .add({ targets: ".socials a", scale: [0.6, 1], opacity: [0, 1], delay: anime.stagger(80), duration: 700, easing: "easeOutBack" }, "-=700")
  .add({ targets: ".hero-photo", opacity: [0, 1], scale: [0.4, 1], rotate: [-25, 0], duration: 1400, easing: "easeOutElastic(1, .7)" }, 200);

// the little sun spins slowly forever
anime({ targets: ".sun", rotate: 360, duration: 12000, loop: true, easing: "linear", autoplay: !reduceMotion });

// ---------- pixel clouds ----------
// Each cloud is a tiny canvas (a few dozen pixels wide) made of random overlapping
// circles, then scaled up with image-rendering: pixelated so it looks like pixel art.
function makeCloud(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  // puffs sit along a baseline, bigger in the middle, so the cloud is wide with a flat bottom
  const base = h * 0.72;
  const puffs = [];
  const n = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;                 // 0..1 across the cloud
    const r = h * (0.28 + 0.32 * Math.sin(Math.PI * t)) * (0.8 + Math.random() * 0.3);
    puffs.push({ x: w * (0.12 + 0.76 * t), y: base - r * 0.35, r });
  }
  const inside = (x, y) => y <= base + 1 && puffs.some((p) => (x - p.x) ** 2 + (y - p.y) ** 2 < p.r ** 2);
  const colours = { top: "#ffe2b8", body: "#f6b3c2", under: "#a78bcf" };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!inside(x, y)) continue;
      let col = colours.body;
      if (!inside(x, y - 2)) col = colours.top;        // top edge catches the sunlight
      else if (y > base - 3) col = colours.under;      // flat underside in shadow
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}
const cloudBox = document.querySelector(".clouds");
function spawnClouds() {
  cloudBox.innerHTML = "";
  const count = window.innerWidth < 700 ? 4 : 7;
  for (let i = 0; i < count; i++) {
    const w = 36 + Math.floor(Math.random() * 34);
    const cloud = makeCloud(w, Math.round(w * 0.38));
    const scale = window.innerWidth < 700 ? 3 : 4 + Math.floor(Math.random() * 3);
    cloud.className = "cloud";
    cloud.style.width = w * scale + "px";
    // keep clouds near the top, or off to the sides, so they never sit behind the name
    const nearEdge = i === 0 || i === count - 1;
    cloud.style.top = (nearEdge ? 10 + Math.random() * 40 : 4 + Math.random() * 10) + "%";
    // spread clouds evenly across the width, with a bit of randomness
    cloud.style.left = ((i + Math.random() * 0.6) / count) * 100 - 10 + "%";
    cloudBox.appendChild(cloud);
    if (!reduceMotion) {
      // drift sideways and back, each cloud at its own speed
      anime({
        targets: cloud,
        translateX: [0, anime.random(-160, 160)],
        duration: anime.random(14000, 26000),
        direction: "alternate", loop: true, easing: "easeInOutSine",
      });
    }
  }
  anime({ targets: ".cloud", opacity: [0, 0.3], delay: anime.stagger(120), duration: 1600, easing: "easeOutExpo" });
}
spawnClouds();
// redraw clouds in the new colours when the theme changes
document.querySelector(".theme-toggle").addEventListener("click", spawnClouds);

// hills rise in, back layers first
anime({ targets: ".hill", translateY: [120, 0], opacity: [0, 1], duration: 1600, delay: anime.stagger(150), easing: "easeOutExpo" });
// parallax: back hills move slower than front hills when you scroll
const hills = [...document.querySelectorAll(".hill")];
window.addEventListener("scroll", () => {
  if (reduceMotion) return;
  const y = window.scrollY;
  if (y > window.innerHeight) return;
  hills.forEach((h, i) => (h.style.transform = `translateY(${y * (0.25 - i * 0.1)}px)`));
}, { passive: true });

// highlight the nav link for the section on screen
const navLinks = [...document.querySelectorAll(".nav nav a")];
const navIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("section[id]").forEach((sec) => navIO.observe(sec));

// photo tilts slightly towards the mouse
const photo = document.querySelector(".hero-photo");
if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  photo.addEventListener("mousemove", (e) => {
    const r = photo.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    anime({ targets: photo, rotateY: x * 14, rotateX: -y * 14, duration: 400, easing: "easeOutQuad" });
  });
  photo.addEventListener("mouseleave", () =>
    anime({ targets: photo, rotateY: 0, rotateX: 0, duration: 900, easing: "easeOutElastic(1, .5)" })
  );
}

// ---------- 4. Scramble text (cycles through words) ----------
const scrambleEl = document.querySelector(".scramble");
const words = scrambleEl.dataset.words.split(",");
const glyphs = "!<>-_\\/[]{}=+*^?#01";
let wordIndex = 0;
function scrambleTo(target) {
  const from = scrambleEl.textContent;
  const len = Math.max(from.length, target.length);
  const state = { p: 0 };
  anime({
    targets: state, p: 1, duration: 700, easing: "linear",
    update: () => {
      let out = "";
      for (let i = 0; i < len; i++) {
        const revealAt = i / len;
        if (state.p > revealAt + 0.25) out += target[i] || "";
        else if (state.p > revealAt) out += glyphs[Math.floor(Math.random() * glyphs.length)];
        else out += from[i] || "";
      }
      scrambleEl.textContent = out;
    },
    complete: () => (scrambleEl.textContent = target),
  });
}
setInterval(() => {
  wordIndex = (wordIndex + 1) % words.length;
  scrambleTo(words[wordIndex]);
}, 2600);

// ---------- 5. Interactive dot grid with ripple (anime.stagger grid) ----------
const grid = document.querySelector(".hero-grid");
let cols, rows;
function buildGrid() {
  cols = Math.ceil(window.innerWidth / 40);
  rows = Math.ceil(window.innerHeight / 40);
  grid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
  grid.innerHTML = "";
  for (let i = 0; i < cols * rows; i++) {
    const cell = document.createElement("div");
    cell.className = "dot-cell";
    cell.dataset.index = i;
    cell.innerHTML = '<div class="dot"></div>';
    grid.appendChild(cell);
  }
}
function ripple(index) {
  anime({
    targets: ".hero-grid .dot",
    keyframes: [
      { scale: 2.2, backgroundColor: palette[Math.floor(Math.random() * palette.length)], duration: 300 },
      { scale: 1, backgroundColor: getComputedStyle(root).getPropertyValue("--dot").trim(), duration: 900 },
    ],
    easing: "easeOutSine",
    delay: anime.stagger(35, { grid: [cols, rows], from: index }),
  });
}
buildGrid();
grid.addEventListener("click", (e) => {
  const cell = e.target.closest(".dot-cell");
  if (cell) ripple(Number(cell.dataset.index));
});
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildGrid, 200);
});
if (!reduceMotion) setTimeout(() => ripple(Math.floor((cols * rows) / 2)), 900);

// ---------- 6. Scroll reveal ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    anime({ targets: entry.target, opacity: [0, 1], translateY: [40, 0], duration: 900, easing: "easeOutExpo" });
    if (entry.target.classList.contains("stats")) countUp();
    io.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- 7. GitHub data: stats + repos ----------
const stats = { public_repos: 38, followers: 0, years: 1 }; // fallback values
async function loadProfile() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
    if (!res.ok) throw new Error(res.status);
    const u = await res.json();
    stats.public_repos = u.public_repos;
    stats.followers = u.followers;
    stats.years = Math.max(1, new Date().getFullYear() - new Date(u.created_at).getFullYear());
  } catch (e) { console.warn("profile fallback", e); }
}
let counted = false;
async function countUp() {
  if (counted) return;
  counted = true;
  await profileReady;
  document.querySelectorAll(".stat .num").forEach((el) => {
    const obj = { v: 0 };
    anime({
      targets: obj, v: stats[el.dataset.key], round: 1, duration: 1600, easing: "easeOutExpo",
      update: () => (el.textContent = obj.v),
    });
  });
}
const profileReady = loadProfile();

// Hand-picked projects. Stars + website links are filled in live from GitHub.
// Each card's thumbnail is an animated scene from project-scenes.js (matched by `scene`).
const FEATURED = [
  {
    repo: "Claude-Checkpoint-Manager-CCM",
    title: "Claude Checkpoint Manager",
    scene: "ccm",
    tagline: "An undo button for AI coding sessions.",
    desc: "A CLI that saves your code and your AI session context together, shows a clean timeline, and rolls back instantly without touching your real git history.",
    tags: ["Node.js", "CLI", "Git"],
    featured: true,
  },
  {
    repo: "tidypaste",
    title: "TidyPaste",
    scene: "tidypaste",
    tagline: "Paste messy text, get it back clean.",
    desc: "Strips tracking junk from links, fixes broken PDF line breaks and copies the clean result for you. Runs fully in your browser.",
    tags: ["JavaScript", "Web app", "Privacy"],
  },
  {
    repo: "termux",
    title: "Termux Field Guide",
    scene: "termux",
    tagline: "Turn your phone into a Linux lab.",
    desc: "A guide to 100+ Linux commands and tools on Android with Termux. No PC needed. My most-starred repo.",
    tags: ["Linux", "Android", "Guide"],
  },
  {
    repo: "RBLXRacer",
    title: "RBLXRacer",
    scene: "racer",
    tagline: "Open-source Roblox racing framework.",
    desc: "A framework for building fast, customisable multiplayer racing games in Roblox Studio with Lua.",
    tags: ["Lua", "Roblox", "Game dev"],
  },
];

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderProjects(live = {}) {
  const gridEl = document.querySelector(".repo-grid");
  gridEl.innerHTML = FEATURED.map((p) => {
    const info = live[p.repo] || {};
    const url = `https://github.com/${GITHUB_USER}/${p.repo}`;
    const stars = info.stargazers_count;
    return `
    <article class="repo${p.featured ? " featured" : ""}">
      <div class="repo-thumb" data-scene="${p.scene}">
        ${stars ? `<span class="badge mono">${stars} stars</span>` : ""}
        ${(window.PROJECT_SCENES || {})[p.scene] || ""}
      </div>
      <div class="repo-body">
        <h3>${escapeHTML(p.title)}</h3>
        <span class="tagline-small">${escapeHTML(p.tagline)}</span>
        <p>${escapeHTML(p.desc)}</p>
        <div class="tags mono">${p.tags.map((t) => `<span>${escapeHTML(t)}</span>`).join("")}</div>
        <div class="repo-buttons">
          <a class="btn ghost" href="${url}" target="_blank" rel="noopener">GitHub</a>
          ${info.homepage ? `<a class="btn" href="${escapeHTML(info.homepage)}" target="_blank" rel="noopener">Live demo</a>` : ""}
        </div>
      </div>
    </article>`;
  }).join("");
  if (window.mountScenes) mountScenes(); // start the thumbnail animations (project-scenes.js)
}

// Render straight away, then animate in when scrolled to, and update with live stars
renderProjects();
const projIO = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  projIO.disconnect();
  anime({
    targets: ".repo", opacity: [0, 1], translateY: [50, 0], rotate: () => [anime.random(-4, 4), 0],
    duration: 900, delay: anime.stagger(110), easing: "easeOutExpo",
    // clear the inline transform afterwards so the CSS hover lift still works
    complete: () => document.querySelectorAll(".repo").forEach((r) => (r.style.transform = "")),
  });
}, { threshold: 0.1 });
document.querySelectorAll(".repo").forEach((r) => (r.style.opacity = 0));
projIO.observe(document.querySelector(".repo-grid"));

(async () => {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`);
    if (!res.ok) throw new Error(res.status);
    const live = {};
    (await res.json()).forEach((r) => (live[r.name] = r));
    const visible = document.querySelector(".repo").style.opacity !== "0";
    renderProjects(live);
    if (!visible) document.querySelectorAll(".repo").forEach((r) => (r.style.opacity = 0));
  } catch (e) { console.warn("live repo info unavailable", e); }
})();

// ---------- 8. Playground ----------
// small helper: burst of particles at (x, y) inside a container
function burst(container, x, y, count = 18, spread = 90) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "spark";
    d.style.left = x + "px";
    d.style.top = y + "px";
    d.style.background = palette[i % palette.length];
    container.appendChild(d);
    parts.push(d);
  }
  anime({
    targets: parts,
    translateX: () => anime.random(-spread, spread),
    translateY: () => anime.random(-spread, spread),
    scale: [{ value: () => anime.random(10, 20) / 10, duration: 200 }, { value: 0, duration: 700 }],
    duration: () => anime.random(700, 1100),
    easing: "easeOutExpo",
    complete: () => parts.forEach((p) => p.remove()),
  });
  const ring = document.createElement("div");
  ring.className = "ring";
  ring.style.cssText = `left:${x}px;top:${y}px;border-color:${palette[anime.random(0, palette.length - 1)]}`;
  container.appendChild(ring);
  anime({
    targets: ring, width: [0, spread * 1.6], height: [0, spread * 1.6],
    marginLeft: [0, -spread * 0.8], marginTop: [0, -spread * 0.8], opacity: [1, 0],
    duration: 800, easing: "easeOutExpo", complete: () => ring.remove(),
  });
}

// --- 8a. catch the sun (mini game) ---
const stage = document.querySelector(".game-stage");
const sun = document.querySelector(".sun-target");
const overlay = document.querySelector(".game-overlay");
const scoreEl = document.querySelector(".score");
const bestEl = document.querySelector(".best");
const msgEl = document.querySelector(".game-msg");
let score = 0, playing = false, best = 0;
try { best = Number(localStorage.getItem("sunBest")) || 0; } catch (e) {}
bestEl.textContent = best;
// idle: the sun floats gently
const sunFloat = anime({ targets: sun, translateY: [-8, 8], duration: 1400, direction: "alternate", loop: true, easing: "easeInOutSine" });

function moveSun() {
  const pad = 40;
  const x = anime.random(pad, stage.clientWidth - pad);
  const y = anime.random(pad + 10, stage.clientHeight - pad);
  anime({
    targets: sun, left: x + "px", top: y + "px", scale: [0.3, 1],
    duration: Math.max(250, 500 - score * 12), easing: "easeOutBack",
  });
}
function startGame() {
  score = 0; scoreEl.textContent = 0; playing = true;
  sunFloat.pause();
  anime({ targets: overlay, opacity: [1, 0], duration: 300, easing: "linear", complete: () => (overlay.style.display = "none") });
  moveSun();
  anime({
    targets: ".timer-bar", scaleX: [1, 0], duration: 20000, easing: "linear",
    complete: endGame,
  });
}
function endGame() {
  playing = false;
  const newBest = score > best;
  if (newBest) {
    best = score; bestEl.textContent = best;
    try { localStorage.setItem("sunBest", best); } catch (e) {}
  }
  msgEl.textContent = newBest ? `New best score: ${score}` : `Score: ${score}. Best: ${best}.`;
  document.querySelector(".game-start").textContent = "Play again";
  overlay.style.display = "";
  anime({ targets: overlay, opacity: [0, 1], duration: 400, easing: "linear" });
  anime({ targets: sun, left: "50%", top: "50%", duration: 600, easing: "easeOutExpo", complete: () => sunFloat.play() });
}
document.querySelector(".game-start").addEventListener("click", startGame);
sun.addEventListener("click", (e) => {
  if (!playing) return;
  score++;
  scoreEl.textContent = score;
  const r = stage.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  burst(stage, x, y, 14, 70);
  // floating +1
  const pop = document.createElement("span");
  pop.className = "pop"; pop.textContent = "+1";
  pop.style.left = x + "px"; pop.style.top = y + "px";
  stage.appendChild(pop);
  anime({ targets: pop, translateY: -50, opacity: [1, 0], duration: 800, easing: "easeOutQuad", complete: () => pop.remove() });
  anime({ targets: scoreEl.parentElement, scale: [1.3, 1], duration: 400, easing: "easeOutElastic(1, .5)" });
  moveSun();
});

// --- 8b. type & explode ---
const typeIn = document.querySelector(".type-in");
const typeOut = document.querySelector(".type-out");
function renderLetters(text, animateLast) {
  typeOut.innerHTML = [...text].map((ch, i) => `<span style="color:${palette[i % palette.length]}">${escapeHTML(ch)}</span>`).join("");
  if (animateLast && typeOut.lastElementChild) {
    anime({ targets: typeOut.lastElementChild, translateY: [-60, 0], rotate: [anime.random(-90, 90), 0], scale: [2, 1], duration: 800, easing: "easeOutElastic(1, .5)" });
  }
}
renderLetters("hello!", false);
const typeStage = document.querySelector(".type-stage");
const boomBtn = document.querySelector(".type-boom");
let exploding = false;
typeIn.addEventListener("input", () => {
  if (exploding) return; // the word is rebuilt from the input when the blast ends
  renderLetters(typeIn.value || "hello!", !!typeIn.value);
});

// the blast itself: flash, shockwave rings, debris and a shake of the box, all from the centre of the stage
function blastFx() {
  const x = typeStage.clientWidth / 2, y = typeStage.clientHeight / 2;

  const flash = document.createElement("div");
  flash.className = "boom-flash";
  typeStage.appendChild(flash);
  anime({
    targets: flash, easing: "linear",
    opacity: [{ value: 1, duration: 70 }, { value: 0, duration: 380, easing: "easeOutQuad" }],
    complete: () => flash.remove(),
  });

  [0, 110].forEach((delay, k) => {
    const size = k ? 190 : 300;
    const ring = document.createElement("div");
    ring.className = "ring";
    ring.style.cssText = `left:${x}px;top:${y}px;opacity:0;border-width:3px;border-color:${k ? palette[1] : "#fff3d6"}`;
    typeStage.appendChild(ring);
    anime({
      targets: ring, width: [0, size], height: [0, size], marginLeft: [0, -size / 2], marginTop: [0, -size / 2],
      opacity: [0.9, 0], duration: 750, delay, easing: "easeOutExpo", complete: () => ring.remove(),
    });
  });

  // debris: little shards fly out in every direction, then drop
  const shards = [], path = [];
  for (let i = 0; i < 44; i++) {
    const s = document.createElement("div");
    const w = anime.random(4, 11);
    s.className = "debris";
    s.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${Math.random() < 0.5 ? w : Math.ceil(w * 0.4)}px;background:${palette[i % palette.length]}`;
    typeStage.appendChild(s);
    shards.push(s);
    const a = Math.random() * Math.PI * 2, d = anime.random(50, 170);
    path.push({ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8 - 15, spin: anime.random(-540, 540) });
  }
  anime({
    targets: shards,
    translateX: { value: (el, i) => path[i].x, duration: 1000, easing: "easeOutExpo" },
    translateY: [
      { value: (el, i) => path[i].y, duration: 420, easing: "easeOutCubic" },
      { value: (el, i) => path[i].y + 70, duration: 600, easing: "easeInQuad" },
    ],
    rotate: { value: (el, i) => path[i].spin, duration: 1000, easing: "easeOutQuad" },
    scale: [{ value: 1.2, duration: 120, easing: "easeOutQuad" }, { value: 0, duration: 900, easing: "easeInQuad" }],
    opacity: [{ value: 1, duration: 600 }, { value: 0, duration: 420, easing: "linear" }],
    complete: () => shards.forEach((s) => s.remove()),
  });

  // the whole box takes a hit
  anime({
    targets: typeStage, easing: "linear",
    translateX: [{ value: -7, duration: 40 }, { value: 7, duration: 40 }, { value: -5, duration: 40 }, { value: 4, duration: 40 }, { value: 0, duration: 60 }],
    translateY: [{ value: 4, duration: 40 }, { value: -4, duration: 40 }, { value: 3, duration: 40 }, { value: -2, duration: 40 }, { value: 0, duration: 60 }],
  });
}

// after the blast, the word pops back in from the centre
function reform() {
  renderLetters(typeIn.value || "hello!", false);
  const fresh = [...typeOut.querySelectorAll("span")];
  fresh.forEach((s) => (s.style.opacity = 0));
  anime({
    targets: fresh, opacity: [0, 1], scale: [0.3, 1], translateY: [24, 0],
    delay: anime.stagger(45, { from: "center" }), duration: 700, easing: "easeOutBack",
    complete: () => { exploding = false; boomBtn.disabled = false; },
  });
}

boomBtn.addEventListener("click", () => {
  if (exploding) return;
  const letters = [...typeOut.querySelectorAll("span")].filter((s) => s.textContent.trim());
  if (!letters.length) return;
  exploding = true;
  boomBtn.disabled = true;
  if (reduceMotion) { reform(); return; }

  // each letter gets thrown away from the centre, mostly upwards
  const box = typeStage.getBoundingClientRect();
  const fly = letters.map((l) => {
    const r = l.getBoundingClientRect();
    const dx = (r.left + r.width / 2 - (box.left + box.width / 2)) / (box.width / 2);
    const vx = dx * 1.2 + (Math.random() - 0.5) * 0.8;
    const vy = -(0.3 + Math.random() * 0.9);
    const len = Math.hypot(vx, vy) || 1, dist = anime.random(90, 150);
    return { x: (vx / len) * dist, y: (vy / len) * dist, spin: anime.random(-720, 720) };
  });
  const jitter = (n) => Array.from({ length: 8 }, (_, i) => ({ value: i === 7 ? 0 : anime.random(-n, n), duration: 55 }));

  anime.timeline({ easing: "linear" })
    // 1. charge-up: the letters shake, swell and glow white-hot
    .add({
      targets: letters,
      translateX: jitter(3), translateY: jitter(3),
      scale: [{ value: 1.35, duration: 440, easing: "easeInQuad" }],
      color: { value: "#fff3d6", duration: 440 },
    })
    // 2. blast: letters are thrown out, spin, shrink and fall while the effects go off
    .add({
      targets: letters,
      begin: blastFx,
      translateX: { value: (el, i) => fly[i].x, duration: 1100, easing: "easeOutCubic" },
      translateY: [
        { value: (el, i) => fly[i].y, duration: 480, easing: "easeOutCubic" },
        { value: (el, i) => fly[i].y + 90, duration: 620, easing: "easeInQuad" },
      ],
      rotate: { value: (el, i) => fly[i].spin, duration: 1100, easing: "easeOutCubic" },
      scale: [{ value: 1.6, duration: 110, easing: "easeOutQuad" }, { value: 0.15, duration: 990, easing: "easeInQuad" }],
      opacity: [{ value: 1, duration: 520 }, { value: 0, duration: 580, easing: "linear" }],
      complete: () => setTimeout(reform, 250),
    });
});

// --- 8c. sunset pit (canvas physics): drop balls, grab them, throw them, flip gravity ---
const pit = document.querySelector(".pit-stage");
const pitHint = document.querySelector(".pit-hint");
const pitFlip = document.querySelector(".pit-flip");
const pitCanvas = document.createElement("canvas");
pit.prepend(pitCanvas);
const pctx = pitCanvas.getContext("2d");
const balls = [];
const MAX_BALLS = 34, BOUNCE = 0.72;
let pw = 0, ph = 0, gravity = 1, grabbed = null, grabAt = { x: 0, y: 0 }, pitRaf = 0, pitLast = 0, seeded = false;
const pitRand = (a, b) => a + Math.random() * (b - a);

function addBall(x, y, r) {
  const radius = r || pitRand(15, 30);
  const b = {
    x, y, vx: pitRand(-2, 2), vy: 0, r: radius, m: radius * radius,
    color: palette[Math.floor(Math.random() * palette.length)],
    sq: 0, sa: 0,          // squash amount and the angle it happened at
    scale: 0.2, dying: false,
  };
  balls.push(b);
  const alive = balls.filter((o) => !o.dying);
  if (alive.length > MAX_BALLS) { // too many: the oldest one shrinks away
    alive[0].dying = true;
    if (grabbed === alive[0]) grabbed = null;
  }
  return b;
}

// squash a ball a little when it hits something (normal = direction of the hit)
function thud(b, speed, angle) {
  const s = Math.min(1, speed / 14);
  if (s > b.sq) { b.sq = s; b.sa = angle; }
}

function pitStep(dt) {
  const g = 0.55 * gravity * dt;
  for (const b of balls) {
    if (b.dying) { b.scale *= Math.pow(0.82, dt); continue; }
    if (b === grabbed) { // a held ball chases the pointer, so letting go throws it at that speed
      b.vx = Math.max(-40, Math.min(40, (grabAt.x - b.x) * 0.35));
      b.vy = Math.max(-40, Math.min(40, (grabAt.y - b.y) * 0.35));
    } else {
      b.vy += g;
      b.vx *= Math.pow(0.9985, dt);
      b.vy *= Math.pow(0.9985, dt);
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.x < b.r) { b.x = b.r; if (b.vx < 0) { thud(b, -b.vx, 0); b.vx = -b.vx * BOUNCE; } }
    else if (b.x > pw - b.r) { b.x = pw - b.r; if (b.vx > 0) { thud(b, b.vx, 0); b.vx = -b.vx * BOUNCE; } }
    if (b.y > ph - b.r) { // floor
      b.y = ph - b.r;
      if (b.vy > 0) { thud(b, b.vy, Math.PI / 2); b.vy = b.vy < 1.2 ? 0 : -b.vy * BOUNCE; }
      b.vx *= Math.pow(0.985, dt);
    } else if (b.y < b.r) { // ceiling
      b.y = b.r;
      if (b.vy < 0) { thud(b, -b.vy, Math.PI / 2); b.vy = b.vy > -1.2 ? 0 : -b.vy * BOUNCE; }
      b.vx *= Math.pow(0.985, dt);
    }
  }

  // ball against ball: push them apart, then bounce them off each other
  for (let i = 0; i < balls.length; i++) {
    for (let k = i + 1; k < balls.length; k++) {
      const a = balls[i], c = balls[k];
      if (a.dying || c.dying) continue;
      const dx = c.x - a.x, dy = c.y - a.y, min = a.r + c.r, d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, overlap = min - d;
      const ia = a === grabbed ? 0 : 1 / a.m, ic = c === grabbed ? 0 : 1 / c.m, sum = ia + ic || 1;
      a.x -= (nx * overlap * ia) / sum; a.y -= (ny * overlap * ia) / sum;
      c.x += (nx * overlap * ic) / sum; c.y += (ny * overlap * ic) / sum;
      const vn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
      if (vn < 0) {
        const imp = (-(1 + BOUNCE) * vn) / sum;
        a.vx -= imp * nx * ia; a.vy -= imp * ny * ia;
        c.vx += imp * nx * ic; c.vy += imp * ny * ic;
        if (-vn > 1.5) { const ang = Math.atan2(ny, nx); thud(a, -vn, ang); thud(c, -vn, ang); }
      }
    }
  }
  // separating balls can shove them into a wall, so keep everything inside the pit
  for (const b of balls) {
    if (b.dying) continue;
    b.x = Math.min(Math.max(b.x, b.r), pw - b.r);
    b.y = Math.min(Math.max(b.y, b.r), ph - b.r);
  }
}

function pitDraw() {
  pctx.clearRect(0, 0, pw, ph);
  const floorY = gravity > 0 ? ph : 0;
  for (const b of balls) { // soft shadow on whichever wall is the floor
    const r = b.r * b.scale, height = Math.abs(floorY - b.y) / ph;
    pctx.fillStyle = `rgba(0,0,0,${Math.max(0, 0.3 - height * 0.3)})`;
    pctx.beginPath();
    pctx.ellipse(b.x, floorY - gravity * 2, r * (1.05 - height * 0.4), 4, 0, 0, 6.283);
    pctx.fill();
  }
  for (const b of balls) {
    const r = b.r * b.scale;
    if (r < 0.5) continue;
    pctx.save();
    pctx.translate(b.x, b.y);
    pctx.rotate(b.sa);
    pctx.scale(1 - b.sq * 0.22, 1 + b.sq * 0.22); // flatten along the hit, bulge sideways
    const grad = pctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, "rgba(255,255,255,0.4)");
    grad.addColorStop(0.55, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.28)");
    pctx.fillStyle = b.color;
    pctx.beginPath(); pctx.arc(0, 0, r, 0, 6.283); pctx.fill();
    pctx.fillStyle = grad;
    pctx.beginPath(); pctx.arc(0, 0, r, 0, 6.283); pctx.fill();
    if (b === grabbed) { pctx.strokeStyle = "rgba(255,255,255,0.85)"; pctx.lineWidth = 2; pctx.stroke(); }
    pctx.restore();
  }
}

function pitFrame(now) {
  pitRaf = requestAnimationFrame(pitFrame);
  const dt = Math.min(2, (now - pitLast) / 16.67 || 1);
  pitLast = now;
  for (let s = 0; s < 3; s++) pitStep(dt / 3); // small sub-steps keep stacking stable
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    if (b.dying) { if (b.scale < 0.05) balls.splice(i, 1); continue; }
    b.scale += (1 - b.scale) * Math.min(1, 0.22 * dt);
    b.sq *= Math.pow(0.86, dt);
  }
  pitDraw();
}

// for people who prefer reduced motion: no animation, balls just settle instantly
function pitSettle() {
  for (let i = 0; i < 600; i++) pitStep(1);
  balls.forEach((b) => { b.scale = b.dying ? 0 : 1; b.sq = 0; });
  for (let i = balls.length - 1; i >= 0; i--) if (balls[i].dying) balls.splice(i, 1);
  pitDraw();
}

function sizePit() {
  const r = pit.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  pw = r.width; ph = r.height;
  pitCanvas.width = Math.max(1, Math.round(pw * dpr));
  pitCanvas.height = Math.max(1, Math.round(ph * dpr));
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  balls.forEach((b) => { b.x = Math.min(Math.max(b.x, b.r), pw - b.r); b.y = Math.min(Math.max(b.y, b.r), ph - b.r); });
  if (!seeded && pw > 0) { // a few balls to start with, so the pit is never empty
    seeded = true;
    for (let i = 0; i < 7; i++) addBall(((i + 0.5) / 7) * pw, pitRand(20, ph * 0.4)).scale = 1;
    if (reduceMotion) pitSettle();
  }
  if (reduceMotion) pitDraw();
}
new ResizeObserver(sizePit).observe(pit);
sizePit();

const pitPoint = (e) => {
  const r = pit.getBoundingClientRect();
  return { x: Math.min(Math.max(e.clientX - r.left, 0), r.width), y: Math.min(Math.max(e.clientY - r.top, 0), r.height) };
};
const letGo = () => { grabbed = null; pit.classList.remove("grabbing"); };
pit.addEventListener("pointerdown", (e) => {
  const p = pitPoint(e);
  let hit = null;
  for (let i = balls.length - 1; i >= 0; i--) { // grab the top-most ball under the pointer...
    const b = balls[i];
    if (!b.dying && (p.x - b.x) ** 2 + (p.y - b.y) ** 2 <= (b.r + 6) ** 2) { hit = b; break; }
  }
  if (!hit) hit = addBall(p.x, p.y); // ...or make a new one right there (hold it to carry it, let go to drop it)
  grabbed = hit;
  grabAt = p;
  pit.classList.add("grabbing");
  try { pit.setPointerCapture(e.pointerId); } catch (err) {}
  if (pitHint) anime({ targets: pitHint, opacity: 0, duration: 300, easing: "linear" });
  if (reduceMotion) { letGo(); pitSettle(); }
});
pit.addEventListener("pointermove", (e) => { if (grabbed) grabAt = pitPoint(e); });
pit.addEventListener("pointerup", letGo);
pit.addEventListener("pointercancel", letGo);
pit.addEventListener("lostpointercapture", letGo);
window.addEventListener("pointerup", letGo);

pitFlip.addEventListener("click", () => {
  gravity = -gravity;
  pitFlip.textContent = gravity > 0 ? "flip gravity" : "flip it back";
  if (reduceMotion) pitSettle();
});

// only simulate while the pit is on screen
if (!reduceMotion) {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      if (!pitRaf) { pitLast = performance.now(); pitRaf = requestAnimationFrame(pitFrame); }
    } else {
      cancelAnimationFrame(pitRaf);
      pitRaf = 0;
    }
  }).observe(pit);
}

// ---------- 10. Konami code easter egg ----------
const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let pos = 0;
window.addEventListener("keydown", (e) => {
  pos = e.key === code[pos] ? pos + 1 : (e.key === code[0] ? 1 : 0);
  if (pos === code.length) { pos = 0; confetti(); }
});
function confetti() {
  const pieces = [];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement("div");
    p.className = "confetti";
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = palette[i % palette.length];
    document.body.appendChild(p);
    pieces.push(p);
  }
  anime({
    targets: pieces,
    translateY: () => window.innerHeight + 40,
    translateX: () => anime.random(-150, 150),
    rotate: () => anime.random(-720, 720),
    duration: () => anime.random(1800, 3200),
    delay: anime.stagger(15),
    easing: "easeInQuad",
    complete: () => pieces.forEach((p) => p.remove()),
  });
}

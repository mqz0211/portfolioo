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
    targets: ".title .char, .title .scramble, .title .hl",
    translateY: [80, 0],
    rotate: [12, 0],
    opacity: [0, 1],
    duration: 1100,
    delay: anime.stagger(30),
  })
  .add({ targets: ".eyebrow, .sub, .hero-cta", opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(100) }, "-=800")
  .add({ targets: ".hero-photo", opacity: [0, 1], translateY: [60, 0], rotate: [6, 0], scale: [0.9, 1], duration: 1400 }, 200)
  .add({ targets: ".avatar", scale: [0, 1], duration: 900, easing: "easeOutElastic(1, .6)" }, 0);

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

// Fallback list if the API is rate-limited
const FALLBACK_REPOS = [
  "tidypaste", "Claude-Checkpoint-Manager-CCM", "zero-to-dev", "termux", "RBLXRacer",
  "IcodeAI", "oh-my-usb", "geometry", "autotyper", "LicenseDesc",
].map((name) => ({ name, description: "", language: null, stargazers_count: 0, html_url: `https://github.com/${GITHUB_USER}/${name}` }));

// Repos I don't want to show on the portfolio
const HIDDEN = new Set([GITHUB_USER, "s", "idk", "fir", "firrr", "boiiii", "hicoolcool"]);

let allRepos = [];
async function loadRepos() {
  const gridEl = document.querySelector(".repo-grid");
  gridEl.innerHTML = '<p class="loading mono">loading repos…</p>';
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(res.status);
    allRepos = (await res.json()).filter((r) => !r.fork && !HIDDEN.has(r.name));
  } catch (e) {
    console.warn("repo fallback", e);
    allRepos = FALLBACK_REPOS;
  }
  buildFilters();
  renderRepos("All");
}
function buildFilters() {
  const langs = ["All", ...new Set(allRepos.map((r) => r.language).filter(Boolean))];
  const box = document.querySelector(".filters");
  box.innerHTML = "";
  langs.forEach((lang, i) => {
    const b = document.createElement("button");
    b.textContent = lang;
    if (i === 0) b.classList.add("active");
    b.addEventListener("click", () => {
      box.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      renderRepos(lang);
    });
    box.appendChild(b);
  });
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function renderRepos(lang) {
  const gridEl = document.querySelector(".repo-grid");
  const list = lang === "All" ? allRepos : allRepos.filter((r) => r.language === lang);
  gridEl.innerHTML = list.map((r) => {
    const name = escapeHTML(r.name);
    const initials = escapeHTML(r.name.replace(/[^A-Za-z0-9]/g, " ").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase());
    // GitHub makes a social preview image for every repo
    const thumb = `https://opengraph.githubassets.com/1/${GITHUB_USER}/${encodeURIComponent(r.name)}`;
    const live = r.homepage ? `<a class="btn" href="${escapeHTML(r.homepage)}" target="_blank" rel="noopener">live site ↗</a>` : "";
    return `
    <article class="repo">
      <div class="repo-thumb">
        <span class="initials">${initials}</span>
        <img src="${thumb}" alt="" loading="lazy" onerror="this.remove()" />
      </div>
      <div class="repo-body">
        <h3>${name}</h3>
        <p>${escapeHTML(r.description || "No description yet. Check out the code!")}</p>
        <div class="meta mono">
          ${r.language ? `<span><span class="lang-dot"></span>${escapeHTML(r.language)}</span>` : ""}
          <span>★ ${r.stargazers_count}</span>
        </div>
        <div class="repo-buttons">
          <a class="btn ghost" href="${escapeHTML(r.html_url)}" target="_blank" rel="noopener">github</a>
          ${live}
        </div>
      </div>
    </article>`;
  }).join("");
  anime({
    targets: ".repo",
    opacity: [0, 1],
    translateY: [30, 0],
    scale: [0.95, 1],
    duration: 700,
    easing: "easeOutExpo",
    delay: anime.stagger(60),
  });
}
loadRepos();

// ---------- 8. Playground ----------
const blocksEl = document.querySelector(".blocks");
for (let i = 0; i < 8; i++) {
  const b = document.createElement("div");
  b.className = "block";
  b.style.background = palette[i % palette.length];
  blocksEl.appendChild(b);
}
const playAnims = {
  wave: () => anime({
    targets: ".block", translateY: [{ value: -50 }, { value: 0 }], duration: 900,
    delay: anime.stagger(80), easing: "easeInOutSine",
  }),
  spin: () => anime({
    targets: ".block", rotate: "+=360", borderRadius: ["8px", "50%", "8px"],
    duration: 1200, delay: anime.stagger(60, { from: "center" }), easing: "easeInOutQuart",
  }),
  shuffle: () => anime({
    targets: ".block",
    translateX: () => anime.random(-120, 120),
    translateY: () => anime.random(-60, 60),
    scale: () => anime.random(5, 15) / 10,
    duration: 700, easing: "easeOutElastic(1, .6)",
    complete: () => anime({ targets: ".block", translateX: 0, translateY: 0, scale: 1, delay: 500, duration: 800, easing: "easeOutExpo" }),
  }),
  draw: () => anime({
    targets: ".wave-path", strokeDashoffset: [anime.setDashoffset, 0], duration: 1500, easing: "easeInOutSine",
  }),
};
document.querySelectorAll("[data-anim]").forEach((btn) =>
  btn.addEventListener("click", () => playAnims[btn.dataset.anim]())
);
// little idle loop on the wave path
anime({
  targets: ".wave-path",
  d: [{ value: "M0 80 Q 75 150 150 80 T 300 80 T 450 80 T 600 80" }, { value: "M0 80 Q 75 10 150 80 T 300 80 T 450 80 T 600 80" }],
  duration: 4000, loop: true, direction: "alternate", easing: "easeInOutSine",
  autoplay: !reduceMotion,
});

// ---------- 9. Toast + copy username ----------
const toast = document.querySelector(".toast");
function showToast(msg) {
  toast.textContent = msg;
  anime.timeline({ targets: toast })
    .add({ translateY: [120, 0], translateX: "-50%", duration: 500, easing: "easeOutBack" })
    .add({ translateY: 120, duration: 400, easing: "easeInQuad", delay: 1600 });
}
document.querySelector(".copy-btn").addEventListener("click", async (e) => {
  try {
    await navigator.clipboard.writeText(e.currentTarget.dataset.copy);
    showToast("copied mqz0211 ✓");
  } catch { showToast("couldn't copy :("); }
});

// ---------- 10. Konami code easter egg ----------
const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let pos = 0;
window.addEventListener("keydown", (e) => {
  pos = e.key === code[pos] ? pos + 1 : (e.key === code[0] ? 1 : 0);
  if (pos === code.length) { pos = 0; confetti(); }
});
function confetti() {
  showToast("🍦 you found the secret! enjoy the ice cream");
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

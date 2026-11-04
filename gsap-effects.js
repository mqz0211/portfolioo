// =========================================================
//  mqz portfolio — GSAP layer (loaded after main.js)
//
//  anime.js still drives the hero intro, clouds, hills, scroll
//  reveals, project cards and the playground. GSAP only touches
//  elements anime.js never animates, so the two libraries never
//  fight over the same transform.
// =========================================================
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // everything here is skipped for people who prefer reduced motion
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // ---- 1. scroll progress bar (scrubbed to the whole page) ----
    gsap.to(".scroll-progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
    });

    // ---- 2. nav items drop in one after another ----
    gsap.from(".nav nav a, .nav .theme-toggle", {
      y: -16,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.07,
      delay: 0.3,
      clearProps: "transform,opacity",
    });

    // ---- 3. hero content drifts up and fades as you scroll past it ----
    gsap.to(".hero-inner", {
      yPercent: -14,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // ---- 4. about: stat cards slide in, skill pills pop in ----
    gsap.from(".stat", {
      x: 60,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".stats", start: "top 88%", once: true },
    });

    gsap.from(".skills span", {
      y: 20,
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      ease: "back.out(1.7)",
      stagger: 0.05,
      scrollTrigger: { trigger: ".skills", start: "top 90%", once: true },
    });

    // skill pills wobble a little on hover (mouse devices only)
    if (window.matchMedia("(hover: hover)").matches) {
      document.querySelectorAll(".skills span").forEach((pill) => {
        pill.addEventListener("pointerenter", () =>
          gsap.to(pill, { y: -4, rotate: gsap.utils.random(-5, 5), duration: 0.25, ease: "power2.out", overwrite: "auto" })
        );
        pill.addEventListener("pointerleave", () =>
          gsap.to(pill, { y: 0, rotate: 0, duration: 0.6, ease: "elastic.out(1, 0.4)", overwrite: "auto" })
        );
      });

      // ---- 5. magnetic contact buttons ----
      document.querySelectorAll(".hero-cta .btn").forEach((btn) => {
        btn.style.transition = "none"; // GSAP drives the movement, so drop the CSS transform transition
        const moveX = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
        const moveY = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
        btn.addEventListener("pointermove", (e) => {
          const r = btn.getBoundingClientRect();
          moveX((e.clientX - (r.left + r.width / 2)) * 0.3);
          moveY((e.clientY - (r.top + r.height / 2)) * 0.3 - 3); // -3 keeps the old hover lift
        });
        btn.addEventListener("pointerleave", () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
        });
      });
    }
  });

  // images, fonts and the GitHub-rendered cards can shift the layout, so re-measure once everything has loaded
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

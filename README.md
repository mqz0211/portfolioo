# mqz — portfolio

My personal portfolio site, built from scratch with HTML, CSS, JavaScript and [anime.js](https://animejs.com/) for Hack Club [Swirl](https://swirl.hackclub.com/).

## Features
1. **Letter-by-letter hero animation**: the title is split into characters and staggered in with an anime.js timeline
2. **Scramble text**: the word after "I build" cycles through words with a glitchy scramble effect
3. **Interactive dot grid**: click anywhere in the hero to send a ripple out from that point (`anime.stagger` with `grid` + `from`)
4. **Live GitHub projects**: repos are fetched from the GitHub API (with an offline fallback list)
5. **Language filters**: filter projects by language, with animated re-rendering
6. **Animated stat counters**: public repos, followers and years on GitHub count up when scrolled into view
7. **Scroll reveal**: sections animate in using IntersectionObserver
8. **Motion playground**: wave, spin, shuffle and SVG-draw demos
9. **Dark / light mode**: the choice is saved in localStorage
10. **Custom cursor** that grows over links and buttons
11. **Copy-to-clipboard** with a toast notification
12. **Easter egg**: enter the Konami code (↑ ↑ ↓ ↓ ← → ← → b a)
13. Responsive layout and `prefers-reduced-motion` support

## Run locally
Open `index.html` in a browser, or run:
```
python3 -m http.server
```

## Deploy
Hosted on Vercel as a static site. No build step is needed.

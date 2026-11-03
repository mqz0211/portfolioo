# mqz — portfolio

My personal portfolio site, built from scratch with HTML, CSS, JavaScript and [anime.js](https://animejs.com/) for Hack Club [Swirl](https://swirl.hackclub.com/).

## Features
1. **Animated hero**: the greeting animates in letter by letter, the photo spins in, and the tagline scrambles between words over a self-drawing squiggle
2. **Pixel-art sunset clouds**: generated with code on tiny canvases every visit, drifting slowly
3. **Interactive dot grid**: click the sky to send a ripple out from that point (`anime.stagger` with `grid` + `from`)
4. **Layered hills** with scroll parallax
5. **Featured projects**: hand-picked cards with live star counts from the GitHub API
6. **Playground**
   - *Catch the sun*: a 20-second click game with a saved best score
   - *Type & explode*: letters bounce in as you type and blow apart on "boom"
   - *Spark pad*: click or drag to make fireworks
7. **Animated stat counters** pulled from the GitHub API
8. **Scroll reveal** and a floating nav that highlights the current section
9. **Dark / light mode**, saved in localStorage
10. **Custom cursor**, photo tilt on hover, and a copy-to-clipboard toast
11. **Easter egg**: enter the Konami code (↑ ↑ ↓ ↓ ← → ← → b a)
12. Responsive layout and `prefers-reduced-motion` support

## Run locally
Open `index.html` in a browser, or run:
```
python3 -m http.server
```

## Deploy
Hosted on Vercel as a static site. No build step is needed.

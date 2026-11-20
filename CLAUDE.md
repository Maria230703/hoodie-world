# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Hoodie World" is a practice prototype of a hoodie e-commerce site for 18–30 year olds, with an elegant but contemporary mood. For now only the landing page exists. It is plain HTML, CSS and JavaScript (`index.html`, `style.css`, `script.js`, plus `images/`), with no framework, no build step, no backend, no package manager and no tests.

## Running it

There is no `server.js` and nothing to build; `node server.js` fails with `MODULE_NOT_FOUND`. Serve the folder statically:

```bash
python3 -m http.server 8765   # run inside hoodie-world/, then open http://localhost:8765
```

Opening `index.html` directly also works.

## Cache-busting (important)

`index.html` loads `style.css?v=N` and `script.js?v=N`. **Increase N every time you change CSS or JS.** Otherwise browsers keep serving the old cached files. This already caused real bugs: an unstyled promo bar, and a "hidden" h1 showing up on screen.

## Architecture

- **Header**: `.site-header` is `position: fixed`. It contains `.header-inner`, the Soft Petrol bar (the background is on `.header-inner`, not on the header). The bar is a 2-column grid: the italic "HW" logo on the left and `.main-nav` on the right, with items aligned to the right margin. Order: Who we are → See Our Collection → Contact us → cart button → favorites button. Cart and favorites are `<button>`s with SVG icons, a counter fixed at `0` and an `aria-label`. They have no click behavior yet; it is still undecided.
- **Hero** (`.hero`): full viewport height (`100svh`). The background photo is `.hero::before`, at `opacity: 0.25` over Soft Petrol. The hero contains:
  - `.promo-bar`, absolutely positioned at `top: var(--header-h)`, so it sits right under the fixed navbar and scrolls away with the page;
  - the "Buy now" link (`.btn-primary`, goes to `#collection`), absolutely placed at `top: 68%` so it sits **below** the "Dress Down, Stay Chic" print on the hoodie in the photo. If you change the image or its cropping, re-check that the button does not cover the print.
- **Promo code**: "NewChicOne" is a `<button class="promo-code">` styled to look exactly like the surrounding text (`font: inherit`, no background, border or padding). In `script.js`:
  - a click copies `data-code` to the clipboard (Clipboard API, with an `execCommand` fallback);
  - a pointer-following `.promo-tip` shows "Copy and use it" on hover, then "Have a chic shopping" after the copy (it auto-hides after 2.5s; on touch devices only the post-copy text appears);
  - screen readers get the result through the visually hidden `#promo-status` live region.
- **Placeholder sections**: `#who-we-are`, `#collection`, `#contact-us`, in the same order as the nav links. They contain only an `<h2>`, and `scroll-margin-top: var(--header-h)` keeps them clear of the fixed navbar.
- **Responsive breakpoints** (in `style.css`):
  - ≥1024px: desktop;
  - 600–1023px: tablet, where the bar shrinks spacing and font size;
  - <600px: phone, where all 5 nav items collapse into a hamburger menu toggled by `script.js` (it also closes on link click and Esc, and resets above 600px).

## Design tokens

Colors live in `:root`:
- `--petrol` (Soft Petrol `#2f5d62`): navbar and hero background;
- `--cream` (Warm Cream `#f5ebdd`): text on petrol and section backgrounds;
- `--terracotta` (Dusty Terracotta `#9c4f37`, darkened for WCAG AA contrast with cream): button and badges;
- `--petrol-deep`: text on the white promo bar.

The font is Manrope (Google Fonts) with a system sans-serif fallback. The promo bar is `rgba(255,255,255,0.6)`.

## Working conventions requested by the owner

- Don't add sections, features or copy that weren't asked for, and never invent text or data.
- Use real `<button>`/`<a>` elements, SVG icons (no emoji), accessible labels and good contrast.
- On request, verify changes at desktop, tablet and phone widths before reporting.
- Commit only when the user approves, with a clear message. Code comments are in Italian.

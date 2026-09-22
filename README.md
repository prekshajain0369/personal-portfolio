# Preksha Jain — Personal Portfolio

A warm, playful, single-page portfolio built with plain **HTML, CSS, and vanilla JavaScript**.
No build step, no backend, no dependencies. Drop the folder on any static host and it works.

---

## Project structure

```
personal-portfolio/
├── index.html            ← all page content (edit text here)
├── css/
│   └── style.css         ← design tokens (colors, spacing), layout, animations
├── js/
│   └── script.js         ← navbar, parallax, reveal-on-scroll, expandable cards
├── assets/
│   └── images/
│       ├── profile.jpg           ← REPLACE: your photo (About Me)
│       ├── about-bg.jpg          ← REPLACE: About section background
│       ├── startup-bg.jpg        ← REPLACE: Startup Ideas background
│       ├── work-bg.jpg           ← REPLACE: Work Experience background
│       ├── achievements-bg.jpg   ← REPLACE: Achievements background
│       └── contact-bg.jpg        ← REPLACE: Contact background
└── README.md
```

The shipped images are plain warm-gradient placeholders so nothing 404s. Replace them with
real files of the **same name** and everything updates automatically.

---

## Run locally

Option 1 — just open the file: double-click `index.html`.

Option 2 — a tiny local server (recommended; matches how it behaves when deployed):

```bash
cd personal-portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

Or with Node: `npx serve .`

> Fonts (Fraunces + Nunito) load from Google Fonts. Offline, the site falls back to system fonts.
> To go fully offline, delete the two `<link ... fonts.googleapis.com ...>` lines in `index.html`.

---

## Deploy

### GitHub Pages
1. Create a new GitHub repository and push this folder's contents to it (so `index.html` is at the repo root).
2. Repo → **Settings → Pages**.
3. Source: **Deploy from a branch** → branch `main`, folder `/ (root)` → Save.
4. Your site appears at `https://<username>.github.io/<repo>/` in a minute or two.

All paths are relative, so it also works under a sub-path like `/repo-name/`.

### Vercel
1. Push the folder to GitHub (or use the Vercel CLI).
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Framework preset: **Other**. Leave build command and output directory **empty**.
4. Deploy. Vercel serves `index.html` at the root.

CLI alternative: `npx vercel` inside the folder and accept the defaults.

---

## What to replace (checklist)

### Images — `assets/images/`
| File | Used for | Suggested size |
|---|---|---|
| `profile.jpg` | About Me photo | ~800×1000, portrait (4:5) |
| `about-bg.jpg` | About section background | ~1200×800 |
| `startup-bg.jpg` | Startup Ideas background | ~1200×800 |
| `work-bg.jpg` | Work Experience background | ~1200×800 |
| `achievements-bg.jpg` | Achievements background | ~1200×800 |
| `contact-bg.jpg` | Contact background | ~1200×800 |

The hero has no image — it uses the generated wave. Each section background = a CSS-drawn pattern **on top of** your image. If you'd rather show
*only* your image (e.g. a hand-drawn pattern you made), add the class `section__bg--image-only`
to that section's background div in `index.html`:

```html
<div class="section__bg section__bg--image-only" data-parallax="0.18" aria-hidden="true"></div>
```

After replacing `profile.jpg`, also delete the `[ADD PROFILE PHOTO]` `<figcaption>` in the About section.

### Contact & social links — `index.html`, `<!-- CONTACT PLACEHOLDERS -->` block
| Card | What to change |
|---|---|
| **Contact Number** | `href="tel:+91XXXXXXXXXX"` and the visible `+91-XXXXXXXXXX` |
| **LinkedIn** | `href="#"` → your profile URL; visible text `[LinkedIn Profile]`; remove `data-placeholder-link` |
| **Gmail** | In the `href`, change `to=email@example.com` (Gmail compose). Also change `data-mailto="mailto:email@example.com..."` (fallback) and the visible `[email@example.com]` |
| **Instagram** | `href="#"` → your profile URL; visible text `[Instagram Profile]`; remove `data-placeholder-link` |

`data-placeholder-link` only stops `#` links from jumping to the top of the page. Remove it once a real URL is in place.

### Startup descriptions — `index.html`, `<section id="startups">`
- **Explored Ideas** (Rareloop, Microvest, PSIE): each `<article class="idea-card idea-card--expandable">` has
  - `.idea-card__desc` → short blurb (visible on the card)
  - `.idea-card__more` → longer text (visible only when expanded)
  - `.idea-card__tag` → the `[ADD DESCRIPTION]` badge; delete it when done
- **Curious About** (DroneX, Surrogate, Piezo Tiles, Walk and Earn, Flying Car): edit `.idea-card__desc` in each card.

### Achievements & Hobbies — `index.html`, `<section id="achievements">`
7 cards (`<article class="card ach-card">`). Edit the emoji, `.ach-card__title`, and the Lorem Ipsum in `.ach-card__desc`.

### About paragraph — `index.html`, `<section id="about">`
Three `<p class="about__para">` blocks. Rewrite freely; the Fun Fact card below is separate.

### Work experience — `index.html`, `<section id="work">`
For each `<li class="card work-card">`:
- `.work-card__company` → name (keep `PSU Thailand ?` until confirmed)
- `.work-card__duration` → replace `Duration <small>[ADD DURATION]</small>` with e.g. `Jan 2023 – Present`
- `.work-card__points` → replace the Lorem ipsum bullets

### Colors / theme — `css/style.css`, `:root` block at the top
All colors, radii, shadows, and spacing are CSS variables. Change `--terracotta`, `--yellow`, etc. to re-theme the whole site.

---

## Features
- Sticky, blurred navbar with active-section highlighting; hamburger menu on mobile
- Smooth scrolling with `scroll-padding-top` so headings aren't hidden under the navbar
- **Interactive hero wave**: hundreds of thin steel-blue SVG lines that drift with layered noise and bend around the cursor (smooth falloff, eased spring-back). Cursor interaction is off on touch devices; the wave still animates. Cold dark theme (navy + icy cyan / violet). Tune colour/density via the `--wave-*` variables on `.hero-wave` in `css/style.css`.
- Subtle parallax on every section background (auto-disabled on touch devices and for `prefers-reduced-motion`)
- Fade-in reveal on scroll
- Explored-idea cards expand to center with a dimmed overlay on **click/tap** (hover only lifts them); close via outside click, **Esc**, or the × button
- Curious-About cards: hover lift only (no expansion)
- Work cards: company left / duration right; duration wraps below on narrow screens
- Contact: exactly four clickable cards in one row on desktop (2×2 on tablet, single column on mobile); phone uses `tel:`, Gmail opens the compose window with a `mailto:` fallback
- Semantic HTML, keyboard-accessible controls, visible focus rings, `aria-*` labels, reduced-motion support
- No horizontal overflow; dark, cold palette (deep navy, icy cyan, soft violet) throughout — all colours are CSS variables in `:root`

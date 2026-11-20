# Current animated portfolio

Live URL: https://abdoabozena7.github.io/main/
GitHub Pages publishes pushes to `main` through
[Deploy portfolio](.github/workflows/pages.yml).

The opening profile (name, badge, tags and buttons) renders complete immediately
on desktop and mobile, without any worker/name-building sequence.
Two print-registration corners and a small ink rule draw around the name once;
the real heading and CV link stay visible and usable the whole time. Reduced
motion presents the finished marks without animation.
The speed guard starts in a small React-independent entry before the portfolio
renderer is downloaded. Fluid input and chapter tracking bind during the first
layout commit, without waiting for images or fonts. A sharp downward wheel or
swipe is immediately resisted with upward movement and a "Slow Down" cue; slowing
down lets browsing continue. For forward movement that passes a whole content
section quickly without meaningful on-screen exposure, the page can still return
to the end of the last section that was skipped, once per section per visit.
Links, keyboard navigation, dialogs and form controls remain exempt.
Use `npm run test:scroll-command` for immediate resistance and
`npm run test:fast-return` for the chapter-tail fallback.
`npm run test:startup` tests the production preview (default port 4182) with the
real renderer deliberately held back, throttled CPU/network, and first wheel/touch
gestures. It also checks one guard instance and fluid readiness at first paint.
Visible embedded browsers do not need to report `document.hasFocus()` for real
wheel/touch input to work. Height-only toolbar resizes preserve an active gesture;
width/orientation changes still cancel it safely. Fluid cleanup does not require
the global `CSSTransition` constructor. `npm run test:in-app` simulates these
conditions in Edge; it is not a test inside the actual Instagram/TikTok apps.
This release retains below-fold content assembly, adaptive browsing
and section-specific "Slow Down" feedback. Only the moving
cursor actors, custom mouse pointer and hero agent illustration stay removed.
The construction clock keeps hidden worker slots for content placement, but does
not render cursor SVGs or run pointer travel, helpers or parking animations.
The same below-fold text/icon/media generation recipes now run on desktop and
mobile. Touch/narrow layouts use three visual work slots (layout, text, asset),
and the shared clock sleeps when no work is visible. Ordinary fluid movement
can defer measurement, but is not treated as an instruction to skip generation.
Anchors, fast-scroll recovery, real control activation and reduced motion still
expose finished readable content. `npm run test:generation` records actual partial
text paint and decoded icon placement on desktop and a throttled mobile profile.
The shared clock uses different reveal masks, placement paths and guide marks
by subject: the portrait develops top-down, Experience logos slide or stamp into
place, certificates unfold, and projects use shutters, diagonal sweeps or traced
connections. Placements and masks use the same damped easing as the water return,
with smaller offsets and quieter guides. Fast jumps still show the finished
content. A late image paints in its reserved slot without holding back the text.
Moving image copies reuse the already-selected responsive thumbnail instead of
requesting the full-size fallback outside its `<picture>` element; zoom remains
full resolution in a lighter WebP, with the original file as fallback.

The optional visit-local score remains mounted once, independently of navigation.
Visible regions receive `data-viewport-active` feedback immediately from their
current viewport rectangles, including in visible embedded browsers that report
`hasFocus() === false`. Company colors/outlines no longer wait for reading credit.
Exposure/score and completion stamps still use dwell and on-screen coverage;
hidden pages, automatic motion and fluid paint do not earn credit. These signals
are used only within the visit; no tracking data is stored or sent, and visibility
cannot prove that anyone read a section. `npm run test:viewport` covers entry/exit, prompt
Experience feedback and the separation between highlighting and earned exposure.
Project and credential descriptions remain readable on mobile. Reduced motion
exposes finished content and keeps the fast-scroll feedback without spatial effects.

The separate fluid-scroll layer gives ordinary wheel input a critically damped
page-pull, with viewport-relative stretch, tilt and shear of the entire content page.
Deformation is deliberately based on the viewport, not the full document height,
so it remains visible on long pages. A natural-flow clipping boundary prevents
the elastic paint from changing the page's actual scroll range. Text, images,
cards, forms and their buttons share one field, including during content assembly.
Construction overlays use the same transform in viewport coordinates; natural
geometry is remeasured after settling. Fixed navigation, dialogs and floating
controls remain stable. It settles
back to the exact original geometry, sleeps when idle and yields immediately to
the chapter-tail return, links, keyboard, forms and image dialogs.
Touch keeps the original gesture rules and gains the same visual drag response.
Height-only mobile toolbar changes preserve the active water response rather than
resetting it between touch steps.
Reduced motion keeps spatial
drag disabled. Remove `useFluidScroll` from `AdaptiveBrowsing` to disable only
this layer without removing content animation or the fast-scroll messages.
The pull stays bounded to 46px, with the same input distance and reduced-motion
behavior. Temporary card reflow does not consume pending wheel distance.

WebP assets are compressed without changing their dimensions. Responsive sizes
are still used for cards, certificates and the portrait; below-fold images remain
lazy-loaded, with only nearby prewarming. Full-resolution zoom uses the compressed
copy with the original retained as fallback. `npm run test:media-readiness`
holds a real image request to check that the text stays readable and the card
keeps its height when the image arrives.

Current checks: `npm test`, `npm run build`, `npm run test:lightweight` and `npm run test:motion`
(with a local server running). The browser check defaults to
http://127.0.0.1:8080/main/ ; set `PORTFOLIO_URL` to use another local preview.
The browsing check covers desktop/tablet/mobile, normal partial-section scrolling,
responsive media, CV download, previews/focus recovery, score, terminal and deep
links. Screenshots and the report go to ignored `output/playwright/lightweight-browsing`.
The motion check verifies no opening worker construction, actual page-pull movement, exact settled geometry,
idle callbacks, touch feedback and reduced motion in `output/playwright/fluid-motion`.

Run `npm run dev -- --host 127.0.0.1 --port 8080` and open
http://127.0.0.1:8080/main/ . Publishing remains a separate action.

The older release records below are historical. The restored motion and optional
fluid-scroll layer are separate commits so the fluid effect can be reverted alone.

---

Latest historical motion revision: the second reference video was decoded into773pictures and reviewed in chronological frame sheets. Lower-page agents travel to measured work sites, grip/type/place/align, then release, in document coordinates that stay attached during scroll. See REFERENCE_V2_PLAN.md. This revision is not deployed.

Current LOCAL revision: strong downward wheel/touch commands translate UP immediately, ordinary commands move DOWN. There is no section/exposure/progress prerequisite. Touch is handled from its first vertical move with proportional displacement and bounded release inertia. See SCROLL_COMMAND_PLAN.md. npm run test:scroll-command (also test:fast-return) runs current acceptance. Published64574cf remains unchanged; older behavior described below is historical.

# Abdelrahman Abozena — current portfolio

Repository: https://github.com/abdoabozena7/Clean_Portofoio . React18, TypeScript, Vite and Tailwind. The current section-aware Slow Down revision is deployed on GitHub Pages (source64574cf; published branch81aa0e8).

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 8080
```

Open http://127.0.0.1:8080/Clean_Portofoio/ . `npm run build` generates `dist`; `npm run preview` serves that production build locally. Publishing is a separate action.

The current published experiment returns fast browsing to a whole section that was skipped without meaningful exposure. It uses the existing per-story expanded-content evidence (at least60%quality and75%block coverage for any story exempts its section). Fast input then moves UP only to that section's start, with a brief palette-colored edge shadow and Slow Down invitation; it does not continue to landing. Slowing restores native browsing. Anchors/keyboard, fields and dialogs are exempt. Configure input thresholds or set `enabled:false` in `src/lib/fastScrollReturn.ts`. `npm run test:fast-return` runs current section-return acceptance. See `SECTION_RETURN_PLAN.md`; the two older return plans are historical. Published with the owner�s approval on3November2026.

Local speed-measurement repair: `scrollVelocity.ts` measures rolling distance/elapsed time rather than imposing16ms per input event. It requires sustained high speed with70%fast-time coverage, ignores isolated spikes and resets across device/direction/idle changes. See `SCROLL_SPEED_PLAN.md`; the previously published version is unchanged. `npm run test:fast-return` now includes frequent-delta/spike controls.

Edit verified professional content and media paths in `src/data/profileContent.ts`. LinkedIn is not scraped at runtime. `constructionRecipes.ts` defines empty slots, placement, typing, duplication, customization and alignment; `constructionDirector.ts` paints the real lower-section UI inside the existing construction clock. Fast scrolling prepares content ahead; slowing down can resume unseen work. Touch keeps hero agents and lightweight lower entrances/adaptive collapse. Reduced motion exposes finished content. Below-fold images begin low-priority loading during the hero.

The circular score estimates qualified exposure among encountered stories; it is not proof of reading/comprehension. Its small curved popup deliberately shows only the current percentage, a plain count, visit-local Best score and an Instagram guessing invitation. Data stays in memory for the visit; no exploration storage or telemetry is used. Company outlines show gradual evidence. Reminders are optional and never lock scrolling or navigate automatically. The Microsoft story link, project/certificate zoom, CV PDF, terminal, mailto contact form and real custom cursor are preserved.

The user-confirmed concurrent About and hero illustration are retained. See `PACED_BROWSING_PLAN.md` for the latest ordered repair checklist, `SCENE_IMPLEMENTATION_PLAN.md` for the construction architecture and `CHANGE_REPORT.md` for results, exceptions and limitations. `npm run test:pace` reproduces moderate input, sustained scan and two current-section reconstruction cycles using native browser input.

Verification commands include `npm run build`, `npm run lint`, `npm test`, `test:scenes`, `test:scenes:recipes`, `test:quality`, `test:discovery:complete`, `test:media-readiness`, `test:scroll-recovery`, `test:cinematic`, `test:dynamic`, `test:fluid`, `test:scan`, `test:hero` and `test:name` (prefix test aliases with `npm run`). Browser scripts use the installed Playwright/Edge runtime; `PLAYWRIGHT_MODULE` can override its location. Source-bound reports, screenshots and recordings are generated under ignored `output/`.

`test:layout:capture` captures all major sections at1440×900,1366×768,768×1024and390×844. `test:layout` requires the preserved local baseline fixtures. Geometry uses unmodified52cfa85; the separate pixel reference uses only the user-approved About/profile patch to match fractional raster origins. See the change report for exact provenance and exemptions. Existing tooling warnings remain documented; physical-device performance and real-user comprehension are not established by these checks.

---

## Historical template documentation and attribution

The original template notes below are retained for attribution; use the current repository, commands and behavior above.

# Abdelrahman's Portfolio

A modern, high-performance portfolio website built with React, TypeScript, and Vite. This project showcases my skills, experience, and projects as a Full Stack Developer, featuring a unique neo-brutalist aesthetic mixed with interactive elements.

## 🚀 Features

- **Interactive Hero Section**: Features a dynamic matrix rain effect and typewriter animations for a high-tech first impression.
- **Neo-Brutalist Design**: Distinct aesthetics with paper textures, bold borders, and high-contrast monochromatic styling.
- **Interactive Terminal**: A custom-built terminal simulation that provides a developer-centric interactive experience.
- **GitHub Integration**: Live visualization of GitHub contributions using `react-github-calendar`.
- **Direct WhatsApp Messaging**: Integrated contact form that redirects users directly to WhatsApp for instant communication.
- **Responsive & Accessible**: Fully optimized for mobile, tablet, and desktop viewports with a focus on semantic HTML and accessibility.
- **Modern Performance**: Standardized with Vite for lightning-fast HMR and optimized production builds.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: Tailwind CSS Animate
- **Routing**: React Router DOM v6
- **State Management**: React Query (TanStack Query)

## 📦 Installation & Setup

To get a local copy up and running, follow these steps:

1. **Clone the repository**

   ```bash
   git clone https://github.com/VARA4u-tech/Vara-s--Portfolio.git
   cd Vara-s--Portfolio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📂 Project Structure

```text
src/
├── components/     # High-level sections (Hero, Contact, Terminal, etc.)
├── pages/          # Individual page components (Index, etc.)
├── ui/             # shadcn/ui primitive components
├── hooks/          # Custom React hooks
├── App.tsx         # Main application routing & structure
└── main.tsx        # Entry point
```

- **LinkedIn**: [vara4u](https://linkedin.com/in/vara4u)

---

_Built with ❤️ and a lot of caffeine by Vara._

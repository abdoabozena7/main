# Portfolio: the AI workshop experience

Live URL: https://abdoabozena7.github.io/main/
GitHub Pages publishes pushes to `main` through
[Deploy portfolio](.github/workflows/pages.yml).
Working on a separate feature branch does not update that deployment; publishing
is a separate action.

The customer-first route puts two selected projects directly after the hero.
Other projects, older roles, and additional credentials remain available through
native disclosures. Direct project links open the relevant disclosure, including
after a reload.

The optional workshop follows an illustrative brief through a build sketch and
real project evidence. It does not call an AI service or pretend to run tasks.
Visitors can skip, choose steps, or replay. Advancing a step brings the scene into
view when necessary; wheel/touch scrolling is never intercepted or reversed.
Reduced motion shows the complete static story. The optional discovery count
records explicit evidence selections for the two briefs, not reading or dwell
time. It stays in memory, resets on reload, and sends nothing.

Responsive WebP thumbnails remain lazy-loaded, with the original file as fallback.
Project previews open the full-resolution original and offer native, scrollable
full-size inspection. The Microsoft story, CV download, and scripted terminal are
preserved. The terminal is an optional footer action on mobile rather than a
floating control over the content; Ctrl+K also opens it.

The contact form opens an email-app draft for the visitor to review and send.
There is no message-delivery backend. Direct email and a copy-address action are
available, including visible feedback if copying is denied.

Current checks: `npm test`, `npm run build`, and `npm run test:lightweight`
(with a local server running). The browser check defaults to
http://127.0.0.1:8080/main/ ; set `PORTFOLIO_URL` to use another local preview.
The browser check uses an installed `playwright` module, or an external module
specified by `PLAYWRIGHT_MODULE`. It launches Chromium by default;
`PLAYWRIGHT_EXECUTABLE_PATH` or `PLAYWRIGHT_CHANNEL` can select an existing browser.
It covers desktop/tablet/mobile including 320 x 568, native wheel/swipe direction,
stable cards, non-overlapping hero actions, workshop/replay/discovery behavior,
reduced motion, responsive media, CV download, full-size previews/focus recovery,
contact labels, terminal focus, and deep links. Screenshots and the report go to
ignored `output/playwright/lightweight-browsing`.

Run `npm run dev -- --host 127.0.0.1 --port 8080` and open
http://127.0.0.1:8080/main/ . Publishing remains a separate action.

The autonomous construction layers, custom cursor, inferred reading score, and
scroll-control experiments are not imported by the active page. The documentation
and acceptance scripts below describe historical revisions, not this experience.

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

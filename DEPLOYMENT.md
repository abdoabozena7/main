# Immediate scroll brake restored - 20 November 2026

The early entry again resists sharp wheel or swipe input immediately and shows
"Slow Down" with the original top placement, styling, motion and rotating
messages. Ordinary scrolling keeps the water motion. The chapter-tail return
still applies to fast full-section passes not caught by the immediate brake.
Generation, image loading and zoom quality are unchanged.

Run `test:scroll-command`, `test:startup`, `test:in-app`, and `test:fast-return`
on the production preview before pushing to `main`. Verify wheel and touch
behavior on https://abdoabozena7.github.io/main/ after the Pages run succeeds.

---

# Waterflow and section return - 19 November 2026

Public URL: https://abdoabozena7.github.io/main/

This release compresses responsive WebP assets and full-resolution previews,
keeps reserved image geometry, and separates text generation from image loading.
Below-fold motion uses damped, quieter placements while keeping the distinct
section treatments and the existing hero.

The early guard now works with actual chapter traversal and existing on-screen
exposure. Only a quick pass across an entire unexposed section can return the
visitor, to that section's tail. It does not collect or transmit analytics.
The legacy unconditional fast-scroll advice in older releases is historical.

The existing [Deploy portfolio workflow](.github/workflows/pages.yml) publishes
verified commits on `main`. Before pushing, run unit tests, the app type check,
and production build; review `test:scroll-command`, `test:motion`,
`test:generation`, `test:lightweight`, `test:startup`, `test:in-app`,
`test:viewport`, and `test:media-readiness` on the production preview. After
Pages succeeds, compare public asset hashes and exercise section return and
motion on the live page.

Image loading, generation, and chapter return are separate commits. Keep
the shared arrival curve while either animation feature still uses it.

---

# Motion chapters release - 18 November 2026

Public URL: https://abdoabozena7.github.io/main/

The opening draws a short print-registration accent around the immediately
readable hero, without restoring workers, cursors or name assembly. The lower
sections share a visual language but use distinct placement paths and reveals:
print development, slide, stamp, unfold, shutter, diagonal and signal. The water
pull is modestly stronger, with the same scroll distance, touch continuity and
fast-scroll rules. Reduced motion keeps the finished, readable page.

The latest motion revision makes page deformation viewport-relative, with visible
stretch/tilt on long documents and unchanged native scroll bounds. The same
below-fold text, icon and media generation now runs on mobile with three visual
work slots. Moving copies reuse decoded responsive thumbnails; original zoom
images remain unchanged. Hero/name construction and cursor actors stay absent.

The latest correction starts scroll protection before the renderer download,
handles visible WebViews without reliable focus, and preserves held gestures
during toolbar-height changes. Immediate viewport highlighting is separate from
earned exposure, so Experience colors/outlines respond without waiting for the
reading score. Fluid motion applies to the whole content page and its construction
overlay, not a whitelist of objects. Navigation/dialog controls remain stable.
Run `test:startup`, `test:in-app` and `test:viewport` alongside the motion/browsing
checks below. Embedded conditions are simulated; actual Instagram/TikTok devices
are not certified by these tests.

The opening profile renders complete from first paint on desktop and mobile;
the worker/name-building animation is excluded from the hero entirely.
This correction preserves below-fold content animation, adaptive browsing,
the original fast-scroll resistance and "Slow Down" messages. Moving cursor/agent
visuals and the hero mascot overlay remain removed.

The release keeps three separately reversible motion phases:

1. Add a one-time registration accent to the opening.
2. Give below-fold chapters distinct construction movements.
3. Increase the bounded whole-page water response.

Revert the water commit alone to restore the previous pull without losing the
opening or chapter motions. Responsive media and speed-sensitive messages are preserved.

Publication uses the existing [Deploy portfolio workflow](.github/workflows/pages.yml)
on pushes to `origin/main`. Before publishing, run the unit tests, application
type check, and production build. Use `test:motion` and `test:generation` on a
production preview to check the opening, real icon/media placement, visibly
different chapter movements and the final scroll geometry.
After publishing, verify the workflow's exact head and live JS/CSS bytes, then run
`test:motion`, `test:generation`, `test:lightweight` and `test:scroll-command` with `PORTFOLIO_URL`
set to the public URL.

The earlier release records below are historical.

---

# Lightweight portfolio release - 14 November 2026

Public URL: https://abdoabozena7.github.io/main/

The current deployment uses the [Deploy portfolio workflow](.github/workflows/pages.yml):
a normal push to `origin/main` builds with Node 22 and `npm ci`, then publishes
the `dist` artifact through GitHub Pages. Do not use the historical `gh-pages`
branch instructions below.

The release is split into three reversible commits:

1. Remove moving agents and the animated pointer, preserving immediate content,
   reduced motion, story links and initial fragment navigation.
2. Restore native scrolling and stable cards, with readable mobile descriptions.
3. Use correctly sized WebP thumbnails while preserving original zoom images.

Revert these commits in reverse order when rolling back dependent changes.
Pre-publication validation includes 31 unit tests, the application TypeScript
check and a production build. `npm run test:lightweight` exercises the current
desktop/tablet/mobile journey; set `PORTFOLIO_URL` to the URL being verified.
After publication, confirm the workflow succeeded for the pushed commit and
compare the public JS/CSS assets with the tested build.

The earlier release records below are historical and use the old repository URL.

---

# Verified discovery-score and complete-hero release - 2 November2026

Live: https://abdoabozena7.github.io/Clean_Portofoio/

- Runtime sourcefbac916 on codex/scroll-agent-construction; finalall-src SHA25650f4982fc2861f381b2beb1e35d0e25a561deff68b59592ad45f145854c72e29.
- Existingnpmrundeploy under continuinguserauthorization publishedgh-pagesd2b58a9666d0336bcb79df0fb065018df5ec4400.
- GitHubPagesworkflow https://github.com/abdoabozena7/Clean_Portofoio/actions/runs/41457057276 completed/success withmatchinghead.
- NormalpublicHTML/all3productionJS-CSSbytehashes match thetestedbuild: index-D3lJIp0R.js, index-N-YmI_9J.css, Tooltip-BAxPWbMb-D76Z9I16.js. SHA256receipts in output/playwright/fluid-live/report.json.
-21actual livechecksPASS: completedrealhero/name/Microsoft, originalshortAbout/projectorder, actualexpandedviewscoregrowth, circularcontrol, actualfastscrollscoredecline, smallcurvedoptionalreminder, noautoreturn/freewheel, explicitmapRevisit, genuine1280x853IMPACTZoom, mobilecompactionwithnoagentsbelowhero, properlabel/rules/accessiblerestoration/nooverflow/runtimeerrors. DefaultnativeEdge transport; previousrecordedHTTP2cold-imagestall caveat remains documented, no universalimage-speed claim.
- Finalsource22productiondiscovery +3actual33story100completion +65fluid +60productioninteractions +28dynamic +21cinematic +2268four-sizegeometry/content/namepixel checksPASS.12scopedhero natural-finishchecksand23name probesvalid;6unit/build/types/lintPASS,7oldFastRefreshwarnings/oldBrowserslistdata. NativeEdge/Chromiumtouch/reducedmotionscope; no physicalSafari/CWV/user-study/smartest-UXclaim.
- Priorpublisheda2432dd remains at baseline/pre-discovery-score-2026-11-02, earlierbaseline/sourcecommits retained. Runtimechanges confined to thenamedsourcebranchandexistinggh-pagesflow. Finalverificationdocscommitchangesnoruntime.

Temporary8082previewstoppedafterverification; existing8080localpreview remains. No mandatorypopup, scrolllock, automaticreturn, analytics/storage/socialpost or LLM API. Full evidence/corrected findings and gamecaption advice in CHANGE_REPORT.md.

---

# Verified fluid browsing and exploration release - 2 November2026

Additional live image verification: all6original project PNGs match local SHA256s and all6fully decode at their real dimensions in native Edge over HTTP/1.1, without routing/mocks. Actual completed screenshot inspected (fluid-live/desktop-projects-decoded.png). The default automated Edge HTTP/2 connection in this environment stalled image streams beyond60s; independent real HTTP downloads completed in0.34-16.28s and HTTP/1.1 Edge completed. This is a recorded transport/environment limitation; no universal cold-image-loading or physical-device speed guarantee is claimed. Runtime assets were not changed to hide it. Receipts: fluid-live/project-images.json and project-image-bytes.json.


Live: https://abdoabozena7.github.io/Clean_Portofoio/

- Runtime source:d49b1e9 on codex/scroll-agent-construction, with final all-src SHA2561dedeceff47cfc7d6fe35a8d7e3d3efd66312e8092cd6dd69925ca16b0d56de1. Report checkpoint2eea6ac; final verification documentation changes no runtime.
- Publishedgh-pages:a2432dd7557161d91ec92f1b190fcb31a5d6cd12, via existing npm run deploy under continuing user authorization.
- GitHub Pages workflow https://github.com/abdoabozena7/Clean_Portofoio/actions/runs/41449790530 completed/success with the matchinghead.
- NormalpublicURL and all3JS/CSSfiles match tested dist bytes: index-D6dkfCKp.js, index-DQFJFabr.css, Tooltip-BAxPWbMb-CxFNsw1c.js. SHA256s and genuine livebrowser receipt: output/playwright/fluid-live/report.json.
-18actual live desktop/mobile checksPASS: original name/Microsoft, shortAbout/projectorder, optionalcircle/noauto-return/freescroll, explicitmapRevisit, genuineIMPACTphoto, mobilehero-onlyagents/compaction/opaque restoration, labelledpercentage and exposure-rulemap, nooverflow/runtimeerrors. Actual live screenshots inspected.
- Final-source25productionexploration/65fluid/60productioninteractions/28dynamic/21cinematic/2268layout across4requiredviewportsPASS. Name23 andhook16scopedproofremainvalid. Build/types/lint/unit4PASS;7originalFastRefreshwarnings/oldBrowserslistdataset. No fieldCWV, physicalSafari or psychological-effect claim. See CHANGE_REPORT.md for scopedinstrumentedperformance and failed-attempt findings.
- Previouspublished5d84feb remains at baseline/pre-fluid-motion-2026-11-02; originalbaseline and intermediate source checkpoints remain in Git. Only the named sourcebranch and existing gh-pages flow updated; no direct default-source-branch mutation.

Existing8080 localpreview stays available; temporary8082 productionpreview is stopped after verification. No social post sent, no new runtime service, storage, analytics or LLM API.

---

# Verified production release — 2 November 2026

Live: https://abdoabozena7.github.io/Clean_Portofoio/

Authorized by the latest user message, after the requested refinements and verification.

- Runtime source:1ea305252907d42fdf566f0d5c7f8945826fc05e on codex/scroll-agent-construction (pushed). Subsequent verification/report commit changes no runtime files.
- App-source SHA256:d5e552652d4763809d582536736c6a49038800d342ed81593ec9a5ee21709c97.
- Published gh-pages:5d84feb3593ed140482b4262077ac1c9076702bb using the repository's existing npm run deploy.
- GitHub Pages workflow: https://github.com/abdoabozena7/Clean_Portofoio/actions/runs/41367635115 — completed/success, matching published head.
- Prior published version:afdb5dcbcd0dc26f9d17e1839f75b164cb7af9f9, preserved at local tag baseline/live-before-attention-2026-11-02. Original design and previous review17d1349 remain in history.

`npm run test:live` passed16 actual checks against the normal URL. The new HTML entry and every production JS/CSS file match local tested dist bytes (SHA256s in output/playwright/attention-live/report.json): index-CtGLab0h.js, index-CpngeyMY.css, Tooltip-BAxPWbMb-CwWYcJf4.js. Live desktop/mobile screenshots and actual Hivo return/lock/green/unlock, authentic IMPACT Zoom, project order, short About, Skills reflow/restoration and no runtime errors were verified. This is a genuine production journey, not a mocked deployment.

Local final-source proof:60 production interactions,28 production dynamic,21 cinematic,83 independent attention +10 featured-layout,1839 comparisons across1440x900/1366x768/768x1024/390x844.19 scoped name probes, actual0px glyph alignment, and14 scoped content probes remain input-coherent. Positive and negative controls retained. Build, types, lint and4 unit tests pass;7 existing Fast Refresh warnings and old Browserslist data remain. See CHANGE_REPORT.md and EVIDENCE.md for details, corrected findings and declared Edge/Chromium scope.

Preview8080 remains available locally. Temporary production8082 is stopped after validation. No direct changes to the default source branch; current source is published in the named branch and deployment follows the existing gh-pages flow. No physical device/Safari or field Core Web Vitals score claimed.

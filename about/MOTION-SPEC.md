# Clean-Room Motion Specification — `/about` Scrollytelling Engine

**Target Surface:** `about/index.html`, `about/about.css`, `about/about-engine.js`
**Reference Extraction:** Clean-room static bundle inspection (`lando-by-OFF+BRAND.js` / `lando-offbrand.shared.4f53262f0.css` from `landonorris.com` in ephemeral `/tmp/rea-lando-lab`)
**Implementation Constraint:** Zero external runtime dependencies. Re-implemented natively via `requestAnimationFrame`, `SVGGeometryElement.getTotalLength()`, and CSS custom properties aligned with the Telemetry design system.

---

## 1. Smooth Scroll Lerp & Damping Interpolation

### Reference Bundle Parameters (`Lenis 1.1.20` inside `lando-by-OFF+BRAND.js`)
- **Primary Linear Interpolation Factor (`lerp`):** `0.1`
- **Touch Synchronization Lerp (`syncTouchLerp`):** `0.075`
- **Wheel & Touch Multipliers:** `wheelMultiplier: 1`, `touchMultiplier: 2`, `touchInertiaMultiplier: 35`
- **Frame-Rate Independent Exponential Damping (`dp`):**
  - `lerp(a, b, t) = (1 - t) * a + t * b`
  - `damp(current, target, lambda, dt) = lerp(current, target, 1 - Math.exp(-lambda * dt))`
  - Where `lambda = lerp * 60` (`0.1 * 60 = 6.0` decay constant per second) and `dt` is the elapsed frame delta in milliseconds scaled by `0.001`.
- **Default Easing Curve (`easing`):**
  - `t => Math.min(1, 1.001 - Math.pow(2, -10 * t))` (exponential out decay)

### Clean-Room Adaptation in `about-engine.js`
- Maintains `targetScroll` (`window.scrollY`) and `animatedScroll` updated inside a `requestAnimationFrame` loop.
- Computes frame-rate independent exponential damping (`lambda = 6.0`) to derive:
  - `scrollProgress` (`[0, 1]` normalized across document scroll limit)
  - `scrollVelocity` (`animatedScroll - previousAnimatedScroll`, smoothed with `0.12` damping)
  - Exposes `--scroll-progress`, `--scroll-velocity`, and `--scroll-tilt` CSS custom properties on `:root` for HUD gauges and velocity-reactive card transforms.

---

## 2. Pinned Chapter Viewport Transitions & Scroll-Scrubbed Timelines

### Reference Bundle Parameters (`GSAP ScrollTrigger` inside `lando-by-OFF+BRAND.js`)
- **Scrubbed Scene Progress:**
  - `start: "top top"`, `end: "bottom bottom"`, `scrub: true` (or `scrub: 1` for smoothed horizontal/vertical track scrubbing), `invalidateOnRefresh: true`.
- **Chapter Trigger Thresholds:**
  - Reveal entry triggers at `start: "top 0.90"` (or `"top 0.80"` for media blocks) with `once: true`.
  - Section theme and HUD state triggers fire at `start: "top center"` / `end: "bottom center"`, interpolating chapter progress continuously across `[0, 1]`.
- **Floating Scroll Indicator Bar (`RF` controller):**
  - Clamps indicator thumb height proportional to viewport-to-document ratio and translates `y` continuously via `ease: "power2.out"` (`300ms` settle, `500ms` idle fade).

### Clean-Room Adaptation in `about-engine.js`
- Tracks each of the four narrative chapters (`[data-act="1"]` through `[data-act="4"]`):
  - **Act I (2018–2021):** First Principles & Bare Metal (Colégio Cotemig & Feluma)
  - **Act II (2024–2025):** Systems & Reliability Foundation (`46 months` cumulative operations foundation across `Hyti` / `SADA Transportes` and `Ana Gaming`)
  - **Act III:** Philosophy of Execution — Jeet Kune Do (JKD) & MUVA
  - **Act IV (2026–Present):** Autonomous Architecture — `6 months` as `Senior AI Engineer (Contract)` (`Sole architect and developer` at MaxStartup) and ongoing `Mother / Hermes` platform engineering (`768d` local embeddings, `Multi-Domain` Qdrant isolation, `Self-hosted LangFuse`)
- Computes per-chapter local progress `p_i = clamp(0, (viewportCenter - rect.top) / rect.height, 1)` on every animation frame, updating `--act-progress` on each chapter card and highlighting the active node in the sticky Telemetry HUD rail.

---

## 3. Dynamic SVG Telemetry Path Drawing

### Reference Bundle Parameters (`DrawSVGPlugin 3.13.0` & Cubic Bezier Track Spine `VP`/`Pp`)
- **Path Length Measurement:**
  - Queries `path.getTotalLength()` once on layout initialization and on debounced (`200ms`) window resize.
  - Initializes `strokeDasharray = totalLength` and `strokeDashoffset = totalLength`.
- **Cubic Bezier Waypoint Spine (`VP` controller):**
  - Connects waypoint anchors `(V[0], V[1], V[2])` via cubic Bezier control points:
    - `CP1 = { x: V[0].x, y: V[0].y + (V[1].y - V[0].y) * 0.4 }`
    - `CP2 = { x: V[1].x, y: V[1].y - (V[1].y - V[0].y) * 0.3 }`
  - Evaluates position along the curve via Bernstein polynomial `B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3`.

### Clean-Room Adaptation in `about-engine.js`
- Renders a continuous vertical SVG telemetry circuit spine (`#telemetry-spine-path`) spanning the four acts, plus per-act schematic SVG signal paths.
- Binds `strokeDashoffset = totalLength * (1 - clampedProgress)` to smoothed scroll progress so the glowing `--accent` (`#00d4aa`) telemetry trace draws itself in real time at high frame rate as the reader scrolls.
- Waypoint pulse nodes (`<circle class="spine-node">`) transition to active state (`data-active="true"`) when the drawn path crosses their normalized vertical coordinate.

---

## 4. Kinetic Typography Split Reveals & Mask Wipes

### Reference Bundle Parameters (`SplitText` + `D7` / `HP` / `E7` controllers)
- **Line & Word Wrapping (`BF` / `HP`):**
  - Preserves an accessible screen-reader clone (`aria-hidden="true"` on visual split nodes, clean text preserved for assistive tech).
  - Wraps visual heading words/lines into masked containers (`.kinetic-line`, `.kinetic-word`).
- **Wipe & Transform Timing (`D7` / `HP`):**
  - Line reveal duration: `600ms` (`0.6s`) with `power2.out` / `cubic-bezier(0.16, 1, 0.3, 1)` easing.
  - Accent highlight bar (`scaleX: 1 -> 0` with `transform-origin: right center`): `600ms` duration, offset by `+300ms` (`duration / 2`).
  - Line stagger interval: `150ms` (`0.15s`) per line; word stagger interval: `20ms` (`0.02s`) per token.

### Clean-Room Adaptation in `about-engine.js` & `about.css`
- Splits `[data-kinetic]` headings into accessible word/line masks while preserving `aria-label` on the parent heading.
- Reveals tokens via `transform: translate3d(0, 0, 0)` and `clip-path` transitions governed by `--ease: cubic-bezier(0.16, 1, 0.3, 1)` with `40ms` per-word stagger and an accent telemetry sweep bar.

---

## 5. Reduced-Motion Accessibility Fallback (`prefers-reduced-motion: reduce`)

### Specification & Determinism Guarantee
- Checked both in CSS (`@media (prefers-reduced-motion: reduce)`) and in JS (`window.matchMedia('(prefers-reduced-motion: reduce)').matches`).
- When active:
  - Disables the continuous `requestAnimationFrame` lerp loop and velocity skew transforms.
  - Sets all SVG paths immediately to `stroke-dashoffset: 0` (fully drawn circuit state).
  - Sets all `[data-kinetic]` and `.reveal-act` elements immediately to `opacity: 1; transform: none; clip-path: none`.
  - Updates the HUD chapter indicator deterministically via native passive scroll listener.

/**
 * Clean-Room Scrollytelling & Telemetry Motion Engine (/about/about-engine.js)
 *
 * Implements the mathematical motion parameters documented in MOTION-SPEC.md:
 * 1. Frame-rate independent exponential scroll damping (lerp = 0.1, lambda = 6.0)
 * 2. Dynamic SVG path scrubbing via getTotalLength(), strokeDasharray, strokeDashoffset
 * 3. Chapter viewport progress tracking & sticky Telemetry HUD synchronization
 * 4. Accessible kinetic typography word-mask reveals (cubic-bezier(0.16, 1, 0.3, 1))
 * 5. Deterministic prefers-reduced-motion fallback
 */
(() => {
  'use strict';

  const LERP = 0.1;
  const LAMBDA = LERP * 60; // 6.0 decay constant per second
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = reducedMotionQuery.matches;

  const root = document.documentElement;
  // .statusbar__fill and .nav[data-stuck] are owned by ../assets/js/main.js
  const spinePath = document.getElementById('telemetry-spine-path');
  const spineNodes = Array.from(document.querySelectorAll('.spine-node'));
  const actPanels = Array.from(document.querySelectorAll('.act-panel[data-act]'));
  const hudSteps = Array.from(document.querySelectorAll('.hud-step[data-act-target]'));
  const hudProgressVal = document.getElementById('hud-progress-val');
  const hudVelocityVal = document.getElementById('hud-velocity-val');
  const hudActiveAct = document.getElementById('hud-active-act');

  // --- 1. Kinetic Typography Split Initialization ---------------------------
  function initKineticHeadings() {
    const headings = document.querySelectorAll('[data-kinetic]');
    headings.forEach((heading) => {
      if (heading.dataset.kineticReady === 'true') return;
      const rawText = heading.textContent.trim().replace(/\s+/g, ' ');
      heading.setAttribute('aria-label', rawText);
      heading.dataset.kineticReady = 'true';

      const words = rawText.split(' ');
      heading.textContent = '';

      words.forEach((word, index) => {
        const mask = document.createElement('span');
        mask.className = 'kinetic-mask';
        mask.setAttribute('aria-hidden', 'true');

        const inner = document.createElement('span');
        inner.className = 'kinetic-word';
        inner.style.setProperty('--word-index', String(index));
        inner.textContent = word;

        mask.appendChild(inner);
        heading.appendChild(mask);

        if (index < words.length - 1) {
          heading.appendChild(document.createTextNode(' '));
        }
      });

      if (isReducedMotion) {
        heading.classList.add('is-revealed');
      }
    });

    if (!isReducedMotion && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
      );
      headings.forEach((h) => observer.observe(h));
    } else {
      headings.forEach((h) => h.classList.add('is-revealed'));
    }
  }

  // --- 2. SVG Telemetry Path Measurement (DrawSVG Clean-Room Equivalent) ----
  const scrubRegistry = [];
  let spineLength = 0;

  function measureSvgPaths() {
    if (spinePath && typeof spinePath.getTotalLength === 'function') {
      spineLength = spinePath.getTotalLength() || 1000;
      spinePath.style.strokeDasharray = `${spineLength}`;
      if (isReducedMotion) {
        spinePath.style.strokeDashoffset = '0';
      }
    }

    scrubRegistry.length = 0;
    actPanels.forEach((panel) => {
      const paths = Array.from(panel.querySelectorAll('[data-scrub-path]'));
      const measured = paths.map((path) => {
        const len = typeof path.getTotalLength === 'function' ? path.getTotalLength() || 300 : 300;
        path.style.strokeDasharray = `${len}`;
        if (isReducedMotion) {
          path.style.strokeDashoffset = '0';
        } else {
          path.style.strokeDashoffset = `${len}`;
        }
        return { path, len };
      });
      scrubRegistry.push({ panel, measured });
    });
  }

  // --- 3. Mathematical Helpers (Lenis Lerp + Exponential Damping) -----------
  function clamp(min, val, max) {
    return Math.max(min, Math.min(val, max));
  }

  function lerp(start, end, t) {
    return (1 - t) * start + t * end;
  }

  function damp(current, target, lambda, dtSeconds) {
    return lerp(current, target, 1 - Math.exp(-lambda * dtSeconds));
  }

  // --- 4. Scroll State & Frame Update Loop ----------------------------------
  let targetScroll = window.scrollY || 0;
  let animatedScroll = targetScroll;
  let smoothedVelocity = 0;
  let lastTime = performance.now();
  let rafId = null;

  function updateScene(scrollY, velocity) {
    const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(0, scrollY / docHeight, 1);

    root.style.setProperty('--scroll-progress', progress.toFixed(4));
    root.style.setProperty('--scroll-velocity', velocity.toFixed(2));

    const tiltDeg = isReducedMotion ? 0 : clamp(-1.4, velocity * -0.025, 1.4);
    root.style.setProperty('--scroll-tilt', `${tiltDeg.toFixed(3)}deg`);

    // .statusbar__fill width and .nav[data-stuck] are updated by ../assets/js/main.js

    // Scrub main SVG spine path
    if (spinePath && spineLength > 0) {
      const offset = isReducedMotion ? 0 : spineLength * (1 - progress);
      spinePath.style.strokeDashoffset = `${offset.toFixed(2)}`;
    }

    // Activate waypoint nodes along spine
    const thresholds = [0.08, 0.36, 0.64, 0.88];
    spineNodes.forEach((node, idx) => {
      const threshold = thresholds[idx] ?? 0.5;
      node.setAttribute('data-active', String(progress >= threshold || (idx === 0 && progress >= 0)));
    });

    // Evaluate per-Act progress & scrub chapter schematics
    const viewportCenter = window.innerHeight * 0.55;
    let activeActId = '1';
    let minDistance = Infinity;

    scrubRegistry.forEach(({ panel, measured }) => {
      const rect = panel.getBoundingClientRect();
      const panelCenter = rect.top + rect.height * 0.5;
      const dist = Math.abs(panelCenter - viewportCenter);
      const actId = panel.getAttribute('data-act') || '1';

      if (dist < minDistance) {
        minDistance = dist;
        activeActId = actId;
      }

      const rawLocal = (window.innerHeight * 0.82 - rect.top) / Math.max(1, rect.height * 0.95);
      const localProgress = clamp(0, rawLocal, 1);
      panel.style.setProperty('--act-progress', localProgress.toFixed(3));

      measured.forEach(({ path, len }) => {
        const dashOffset = isReducedMotion ? 0 : len * (1 - localProgress);
        path.style.strokeDashoffset = `${dashOffset.toFixed(2)}`;
      });
    });

    actPanels.forEach((panel) => {
      panel.setAttribute('data-active', String(panel.getAttribute('data-act') === activeActId));
    });

    hudSteps.forEach((step) => {
      step.setAttribute('data-active', String(step.getAttribute('data-act-target') === activeActId));
    });

    if (hudProgressVal) {
      hudProgressVal.textContent = `${Math.round(progress * 100)
        .toString()
        .padStart(3, '0')}%`;
    }
    if (hudVelocityVal) {
      const vAbs = Math.min(999, Math.round(Math.abs(velocity) * 10));
      hudVelocityVal.textContent = `${vAbs.toString().padStart(3, '0')} px/s`;
    }
    if (hudActiveAct) {
      hudActiveAct.textContent = `ACT 0${activeActId}`;
    }
  }

  function tick(now) {
    const dt = clamp(0.001, (now - lastTime) * 0.001, 0.1);
    lastTime = now;

    targetScroll = window.scrollY || 0;
    const prevAnimated = animatedScroll;
    animatedScroll = damp(animatedScroll, targetScroll, LAMBDA, dt);

    const frameDelta = animatedScroll - prevAnimated;
    smoothedVelocity = damp(smoothedVelocity, frameDelta, 10, dt);

    updateScene(animatedScroll, smoothedVelocity);

    if (!isReducedMotion) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function startEngine() {
    initKineticHeadings();
    measureSvgPaths();

    if (isReducedMotion) {
      if (rafId) cancelAnimationFrame(rafId);
      updateScene(window.scrollY || 0, 0);
      window.addEventListener(
        'scroll',
        () => {
          updateScene(window.scrollY || 0, 0);
        },
        { passive: true }
      );
    } else {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  }

  // Debounced resize handler (200ms per reference bundle)
  let resizeTimer = null;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measureSvgPaths();
        updateScene(window.scrollY || 0, 0);
      }, 200);
    },
    { passive: true }
  );

  reducedMotionQuery.addEventListener('change', (e) => {
    isReducedMotion = e.matches;
    startEngine();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startEngine);
  } else {
    startEngine();
  }
})();

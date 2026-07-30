/* ==========================================================================
   Rafael Viotti — Portfolio interactions
   Vanilla JS, no dependencies. Every effect degrades gracefully and
   honours prefers-reduced-motion.
   ========================================================================== */

(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Theme ------------------------------------------------------------- */
  // Initial theme is set by an inline script in <head> to avoid a flash.
  // This only wires the toggle.

  function initTheme() {
    const btn = $('#theme-toggle');
    if (!btn) return;

    const sync = () => {
      const dark = document.documentElement.dataset.theme !== 'light';
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('aria-pressed', String(!dark));
    };

    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (_) {}
      sync();
    });

    sync();
  }

  /* --- Nav --------------------------------------------------------------- */

  function initNav() {
    const nav    = $('.nav');
    const links  = $('.nav__links');
    const toggle = $('.nav__toggle');
    if (!nav) return;

    const onScroll = () => { nav.dataset.stuck = String(window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!links || !toggle) return;

    const close = () => {
      links.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      links.dataset.open = 'true';
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      links.dataset.open === 'true' ? close() : open();
    });

    $$('a', links).forEach((a) => a.addEventListener('click', close));

    document.addEventListener('click', (e) => {
      if (links.dataset.open !== 'true') return;
      if (!links.contains(e.target) && !toggle.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    close();
  }

  /* --- Scroll progress --------------------------------------------------- */

  function initProgress() {
    const fill = $('.statusbar__fill');
    if (!fill) return;

    let queued = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
      queued = false;
    };

    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* --- Smooth anchor scroll (accounts for fixed nav) --------------------- */

  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 74;
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
        history.replaceState(null, '', id);
      });
    });
  }

  /* --- Reveal on scroll -------------------------------------------------- */

  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('is-in'), delay);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    items.forEach((el) => io.observe(el));
  }

  /* --- Typed line -------------------------------------------------------- */

  function initTyped() {
    const el = $('#typed');
    if (!el) return;

    const lines = [
      'building RAG pipelines with measurable evals',
      'automating infrastructure operations in Python',
      'monitoring what runs in production',
      'turning ops experience into AI systems',
    ];

    if (reduced) { el.textContent = lines[0]; return; }

    let li = 0, ci = 0, deleting = false;

    const tick = () => {
      const line = lines[li];
      el.textContent = line.slice(0, deleting ? --ci : ++ci);

      let wait = deleting ? 34 : 62;
      if (!deleting && ci === line.length) { wait = 2400; deleting = true; }
      else if (deleting && ci === 0)       { deleting = false; li = (li + 1) % lines.length; wait = 420; }

      setTimeout(tick, wait);
    };

    setTimeout(tick, 700);
  }

  /* --- Hero signal field ------------------------------------------------
     Animated telemetry traces. This is the signature visual: it reads as
     a monitoring graph, which is the honest metaphor for this profile.
     Pauses when offscreen or when the tab is hidden.
     ---------------------------------------------------------------------- */

  function initSignalField() {
    const canvas = $('#signal');
    if (!canvas || reduced) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, raf = null, t = 0, visible = true;

    const traces = [
      { amp: 0.13, freq: 1.5, speed: 0.0055, width: 1.6, alpha: 0.55, y: 0.42 },
      { amp: 0.09, freq: 2.4, speed: 0.0080, width: 1.1, alpha: 0.34, y: 0.55 },
      { amp: 0.06, freq: 3.6, speed: 0.0110, width: 0.9, alpha: 0.20, y: 0.66 },
    ];

    const accentOf = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00d4aa';

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const accent = accentOf();

      // Faint grid — the dashboard substrate
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.05;
      ctx.lineWidth = 1;
      const step = 64;
      ctx.beginPath();
      for (let x = (t * 0.35) % step; x < w; x += step) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += step) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Traces
      traces.forEach((tr) => {
        ctx.beginPath();
        ctx.globalAlpha = tr.alpha;
        ctx.strokeStyle = accent;
        ctx.lineWidth = tr.width;
        ctx.lineJoin = 'round';

        const baseY = h * tr.y;
        const amp = h * tr.amp;

        for (let x = 0; x <= w; x += 3) {
          const p = x / w;
          // Two summed sines + a slow envelope: organic, never repeats visibly
          const y = baseY
            + Math.sin(p * Math.PI * 2 * tr.freq + t * tr.speed) * amp
            + Math.sin(p * Math.PI * 2 * tr.freq * 0.41 - t * tr.speed * 1.6) * amp * 0.42;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
    }

    function loop() {
      t += 1;
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start() { if (!raf && visible) loop(); }
    function stop()  { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    resize();
    start();

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { resize(); draw(); }, 150);
    });

    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0 }).observe(canvas);
    }
  }

  /* --- Contact form -----------------------------------------------------
     Posts to the endpoint in data-endpoint (Web3Forms / Formspree / any
     JSON form API). With no endpoint configured it falls back to a
     prefilled mailto so the form is never a dead end.
     ---------------------------------------------------------------------- */

  function initForm() {
    const form = $('#contact-form');
    if (!form) return;

    const status = $('#form-status');
    const submit = $('button[type="submit"]', form);
    const say = (msg, ok) => {
      if (!status) return;
      status.textContent = msg;
      status.dataset.ok = String(ok);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());
      const endpoint = form.dataset.endpoint || '';

      if (!data.name || !data.email || !data.message) {
        say('Please fill in name, email and message.', false);
        return;
      }

      // No backend wired yet → hand off to the mail client, losing nothing.
      if (!endpoint || endpoint.includes('YOUR_')) {
        const subject = encodeURIComponent(`Portfolio contact — ${data.name}`);
        const body = encodeURIComponent(`${data.message}\n\n—\n${data.name}\n${data.email}`);
        window.location.href = `mailto:rafaelviotti@gmail.com?subject=${subject}&body=${body}`;
        say('Opening your email client…', true);
        return;
      }

      const original = submit ? submit.textContent : '';
      if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
      say('', true);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        say('Message sent. I will get back to you shortly.', true);
      } catch (_) {
        say('Could not send. Email me directly at rafaelviotti@gmail.com.', false);
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = original; }
      }
    });
  }

  /* --- Footer year ------------------------------------------------------- */

  function initYear() {
    const el = $('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --- Boot -------------------------------------------------------------- */

  const boot = () => {
    initTheme();
    initNav();
    initProgress();
    initAnchors();
    initReveal();
    initTyped();
    initSignalField();
    initForm();
    initYear();
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();

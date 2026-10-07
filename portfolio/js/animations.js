/* ==========================================================================
   animations.js — the motion system
   --------------------------------------------------------------------------
   How it works, in short:
   1. CSS holds every "hidden" and "visible" state (see css/animations.css).
      JavaScript only toggles classes or sets CSS variables, so the browser
      animates transform/opacity on the compositor.
   2. Page load:  loader finishes -> <body class="is-ready"> -> hero plays.
   3. Scroll:     an IntersectionObserver adds .is-in to [data-reveal] elements.
   4. One requestAnimationFrame loop drives smooth scroll (Lenis), the mouse
      glow, the custom cursor, and the scroll-linked bits (progress bar,
      portrait parallax, timeline fill, active nav link).
   5. Pointer effects (cursor, magnetic buttons, tilt) only run on devices
      with a mouse, and everything is skipped for prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";
  var App = (window.App = window.App || {});

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  App.reduced = reduced;
  App.finePointer = finePointer;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- Split hero text into characters ---------- */
  function splitText() {
    $$("[data-split]").forEach(function (line, lineIndex) {
      var text = line.textContent;
      line.textContent = "";
      line.setAttribute("aria-hidden", "true"); // the <h1> carries an aria-label
      line.style.setProperty("--line-delay", lineIndex * 130 + "ms");
      text.split("").forEach(function (ch, i) {
        var span = document.createElement("span");
        span.className = "char";
        span.style.setProperty("--i", i);
        span.textContent = ch === " " ? " " : ch;
        line.appendChild(span);
      });
    });
  }

  /* ---------- Loader -> ready ---------- */
  function runLoader(onReady) {
    var loader = $("#loader");
    var count = $("#loaderCount");
    var done = function () {
      if (loader) loader.classList.add("is-done");
      document.body.classList.add("is-ready");
      onReady();
    };
    if (reduced || !loader) { done(); return; }

    var start = performance.now(), DURATION = 1250;
    (function tick(now) {
      var p = clamp((now - start) / DURATION, 0, 1);
      var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      if (count) count.textContent = ("00" + Math.round(eased * 100)).slice(-3);
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(done, 180);
    })(start);
  }

  /* ---------- Typed role line ---------- */
  function typedRoles() {
    var el = $("#typed");
    if (!el || reduced) return;
    var words = (el.getAttribute("data-words") || "").split("|").filter(Boolean);
    if (words.length < 2) return;
    var w = 0, i = words[0].length, deleting = true;

    function step() {
      var word = words[w];
      if (deleting) {
        i--;
        el.textContent = word.slice(0, i);
        if (i <= 0) { deleting = false; w = (w + 1) % words.length; return setTimeout(step, 320); }
        return setTimeout(step, 24);
      }
      i++;
      el.textContent = words[w].slice(0, i);
      if (i >= words[w].length) { deleting = true; return setTimeout(step, 2400); }
      setTimeout(step, 46);
    }
    setTimeout(step, 3200);
  }

  /* ---------- Scroll reveals ---------- */
  function reveals() {
    var items = $$("[data-reveal], .skill, .project");
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in", "is-settled"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (entry, i) {
        var el = entry.target;
        var delay = Math.min(i, 10) * 70; // stagger items that arrive together
        el.style.setProperty("--d", delay + "ms");
        el.classList.add("is-in");
        io.unobserve(el);
        setTimeout(function () { el.classList.add("is-settled"); el.style.removeProperty("--d"); }, delay + 1200);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    App.revealObserver = io;
  }

  /* ---------- Count-up numbers ---------- */
  function counters() {
    var nums = $$("[data-count]");
    if (reduced || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, target = parseFloat(el.getAttribute("data-count")) || 0;
        var start = performance.now(), DURATION = 1400;
        io.unobserve(el);
        (function tick(now) {
          var p = clamp((now - start) / DURATION, 0, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { el.textContent = "0"; io.observe(el); });
  }

  /* ---------- Pointer effects (mouse devices only) ---------- */
  var mouse = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.3, seen: false };
  var glowPos = { x: mouse.x, y: mouse.y };
  var ringPos = { x: mouse.x, y: mouse.y };
  var glow, cursor, dot, ring;

  function pointerEffects() {
    glow = $(".bg__glow");
    if (!finePointer || reduced) return;

    cursor = $(".cursor"); dot = $(".cursor__dot"); ring = $(".cursor__ring");
    document.documentElement.classList.add("has-cursor");
    if (cursor) cursor.classList.add("is-out");

    var spotlightSel = ".card, .project, .skill, .portrait";
    var hoverSel = "a, button, [role='button'], input, textarea, .skill";

    window.addEventListener("pointermove", function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (!mouse.seen) { mouse.seen = true; ringPos.x = mouse.x; ringPos.y = mouse.y; if (cursor) cursor.classList.remove("is-out"); }

      // cursor-following light inside the card under the pointer
      var t = e.target.closest ? e.target.closest(spotlightSel) : null;
      if (t) {
        var r = t.getBoundingClientRect();
        t.style.setProperty("--mx", e.clientX - r.left + "px");
        t.style.setProperty("--my", e.clientY - r.top + "px");
      }
      if (cursor) cursor.classList.toggle("is-hover", !!(e.target.closest && e.target.closest(hoverSel)));
    }, { passive: true });

    document.addEventListener("pointerdown", function () { if (cursor) cursor.classList.add("is-down"); });
    document.addEventListener("pointerup", function () { if (cursor) cursor.classList.remove("is-down"); });
    document.documentElement.addEventListener("mouseleave", function () { if (cursor) cursor.classList.add("is-out"); });
    document.documentElement.addEventListener("mouseenter", function () { if (cursor) cursor.classList.remove("is-out"); });

    // Magnetic buttons
    $$("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + dx * 0.22 + "px," + dy * 0.32 + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });

    // Portrait tilt
    var visual = $(".hero__visual"), portrait = $("#portrait");
    if (visual && portrait) {
      visual.addEventListener("pointermove", function (e) {
        var r = portrait.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        portrait.style.setProperty("--ry", clamp(px * 12, -9, 9) + "deg");
        portrait.style.setProperty("--rx", clamp(-py * 10, -8, 8) + "deg");
      });
      visual.addEventListener("pointerleave", function () {
        portrait.style.setProperty("--ry", "0deg");
        portrait.style.setProperty("--rx", "0deg");
      });
    }
  }

  /* ---------- Scroll-linked updates ---------- */
  var lastY = -1, els = {};

  function cacheScrollEls() {
    els.progress = $("#progressBar");
    els.nav = $("#nav");
    els.portraitImg = $(".portrait__frame img");
    els.floats = $$("[data-float]");
    els.timeline = $("#timeline");
    els.fill = $("#timelineFill");
    els.navLinks = $$(".nav__links a");
    els.sections = els.navLinks.map(function (a) { return document.getElementById(a.getAttribute("data-nav")); });
  }

  function onScrollFrame(y) {
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;

    if (els.progress) els.progress.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1) : 0) + ")";
    if (els.nav) els.nav.classList.toggle("is-stuck", y > 40);

    // hero parallax (only while the hero is on screen)
    if (!reduced && y < vh * 1.2) {
      if (els.portraitImg) els.portraitImg.style.setProperty("--py", (y * 0.05).toFixed(1) + "px");
      els.floats.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-float")) || 0;
        el.style.transform = "translate3d(0," + ((y * speed) / 100).toFixed(1) + "px,0)";
      });
    }

    // timeline rail fills as you scroll through the experience section
    if (els.timeline && els.fill) {
      var r = els.timeline.getBoundingClientRect();
      var p = clamp((vh * 0.7 - r.top) / r.height, 0, 1);
      els.fill.style.transform = "scaleY(" + p.toFixed(3) + ")";
    }

    // active nav link
    var current = 0;
    els.sections.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top <= vh * 0.42) current = i;
    });
    if (max > 0 && y >= max - 4) current = els.sections.length - 1;
    els.navLinks.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }

  /* ---------- The single animation loop ---------- */
  function loop(time) {
    if (App.lenis) App.lenis.raf(time);

    var y = window.scrollY || window.pageYOffset;
    if (y !== lastY) { lastY = y; onScrollFrame(y); }

    if (finePointer && !reduced) {
      if (glow) {
        glowPos.x = lerp(glowPos.x, mouse.x, 0.06);
        glowPos.y = lerp(glowPos.y, mouse.y, 0.06);
        glow.style.transform = "translate3d(" + glowPos.x.toFixed(1) + "px," + glowPos.y.toFixed(1) + "px,0)";
      }
      if (dot && ring) {
        ringPos.x = lerp(ringPos.x, mouse.x, 0.16);
        ringPos.y = lerp(ringPos.y, mouse.y, 0.16);
        dot.style.transform = "translate3d(" + mouse.x + "px," + mouse.y + "px,0)";
        ring.style.transform = "translate3d(" + ringPos.x.toFixed(1) + "px," + ringPos.y.toFixed(1) + "px,0)";
      }
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Public entry point (called from main.js) ---------- */
  App.initAnimations = function () {
    splitText();
    cacheScrollEls();
    pointerEffects();
    counters();
    window.addEventListener("resize", function () { lastY = -1; }, { passive: true });
    requestAnimationFrame(loop);

    runLoader(function () {
      reveals();
      typedRoles();
    });
  };
})();

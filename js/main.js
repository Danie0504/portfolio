/* ==========================================================================
   main.js — site behaviour: smooth scroll, navigation, mobile menu,
   experience accordion, filters, project dialog, contact form, social links
   ========================================================================== */
(function () {
  "use strict";
  var App = (window.App = window.App || {});
  var CONFIG = window.PORTFOLIO_CONFIG || {};

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Smooth scrolling (Lenis) ---------- */
  function initSmoothScroll() {
    if (reduced || typeof window.Lenis !== "function") return;
    try {
      App.lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    } catch (err) {
      App.lenis = null; // native scrolling still works
    }
  }

  function scrollToTarget(target) {
    if (App.lenis) App.lenis.scrollTo(target, { offset: target.id === "home" ? 0 : -72, duration: 1.3 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  /* ---------- In-page links + mobile menu ---------- */
  function initNav() {
    var toggle = $("#navToggle"), menu = $("#mobileMenu");

    function setMenu(open) {
      if (!toggle || !menu) return;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        menu.hidden = false;
        // next frame so the opening transition runs
        requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("is-open"); }); });
        if (App.lenis) App.lenis.stop();
        document.body.style.overflow = "hidden";
      } else {
        menu.classList.remove("is-open");
        setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 460);
        if (App.lenis) App.lenis.start();
        document.body.style.overflow = "";
      }
    }

    if (toggle) toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && toggle && toggle.getAttribute("aria-expanded") === "true") setMenu(false);
    });

    document.addEventListener("click", function (e) {
      var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!link) return;
      var id = link.getAttribute("href").slice(1);
      var target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      scrollToTarget(target);
      if (history.replaceState) history.replaceState(null, "", "#" + id);
      // move keyboard focus to the section without an extra jump
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  /* ---------- Experience accordion ---------- */
  function initAccordion() {
    $$(".job__head").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var job = btn.closest(".job");
        var open = !job.classList.contains("is-open");
        job.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---------- Tabs / filters ---------- */
  function movePill(tabs) {
    var pill = $(".tabs__pill", tabs), active = $("button.is-active", tabs);
    if (!pill || !active) return;
    pill.style.width = active.offsetWidth + "px";
    pill.style.transform = "translateX(" + active.offsetLeft + "px)";
  }

  function initTabs(tabsId, onFilter) {
    var tabs = document.getElementById(tabsId);
    if (!tabs) return;
    tabs.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      $$("button", tabs).forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      movePill(tabs);
      onFilter(btn.getAttribute("data-filter"));
    });
    movePill(tabs);
    window.addEventListener("resize", function () { movePill(tabs); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { movePill(tabs); });
  }

  function filterSkills(cat) {
    $$("#skillGrid .skill").forEach(function (el) {
      el.classList.toggle("is-dim", cat !== "all" && el.getAttribute("data-cat") !== cat);
    });
  }

  function filterProjects(cat) {
    $$("#projectGrid .project").forEach(function (el, i) {
      var show = cat === "all" || el.getAttribute("data-cat") === cat;
      el.classList.toggle("is-hidden", !show);
      if (show && !reduced) {
        // replay the entrance for the cards that remain
        el.classList.remove("is-in", "is-settled");
        el.style.setProperty("--d", i * 60 + "ms");
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          el.classList.add("is-in");
          setTimeout(function () { el.classList.add("is-settled"); }, 1300);
        }); });
      }
    });
  }

  /* ---------- Project dialog ---------- */
  function initProjects() {
    var grid = $("#projectGrid"), modal = $("#projectModal"), close = $("#modalClose");
    if (!grid || !modal) return;

    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".project");
      if (card) App.openProject(Number(card.getAttribute("data-index")));
    });
    grid.addEventListener("keydown", function (e) {
      var card = e.target.closest(".project");
      if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); App.openProject(Number(card.getAttribute("data-index"))); }
    });

    if (close) close.addEventListener("click", function () { modal.close ? modal.close() : modal.removeAttribute("open"); });
    modal.addEventListener("click", function (e) { if (e.target === modal && modal.close) modal.close(); }); // backdrop click
    modal.addEventListener("close", function () { if (App.lenis) App.lenis.start(); });
  }

  /* ---------- Social links (from config.js) ---------- */
  function initSocials() {
    var list = $("#socialList"), footer = $("#footerSocial");
    var rows = "", footerRows = "";
    var email = (CONFIG.email || "").trim();

    if (email) {
      rows += '<li><a href="mailto:' + esc(email) + '"><b>Email</b><small>' + esc(email) + "</small></a></li>";
      footerRows += '<li><a href="mailto:' + esc(email) + '">Email</a></li>';
    } else {
      rows += '<li><span class="social--todo"><b>Email</b><small>Add your email</small></span></li>';
    }

    (CONFIG.socials || []).forEach(function (s) {
      var url = /^https?:\/\//i.test(s.url || "") ? s.url : "";
      if (url) {
        rows += '<li><a href="' + esc(url) + '" target="_blank" rel="noopener"><b>' + esc(s.label) + "</b><small>" + esc(s.handle || "Open ↗") + "</small></a></li>";
        footerRows += '<li><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(s.label) + "</a></li>";
      } else {
        rows += '<li><span class="social--todo"><b>' + esc(s.label) + "</b><small>Add link</small></span></li>";
      }
    });

    if (list) list.innerHTML = rows;
    if (footer) footer.innerHTML = footerRows;
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    var form = $("#contactForm"), status = $("#formStatus");
    if (!form) return;

    var rules = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Please write a message of at least 10 characters."; }
    };

    function validateField(input) {
      var msg = rules[input.name] ? rules[input.name](input.value) : "";
      var field = input.closest(".field"), err = document.getElementById("err-" + input.name);
      field.classList.toggle("has-error", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) { err.textContent = msg; input.setAttribute("aria-describedby", err.id); }
      return !msg;
    }

    function setStatus(html, ok) {
      status.innerHTML = html;
      status.classList.toggle("is-ok", !!ok);
    }

    $$("input, textarea", form).forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value) validateField(input); });
      input.addEventListener("input", function () { if (input.closest(".field").classList.contains("has-error")) validateField(input); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var inputs = $$("input, textarea", form);
      var firstBad = null;
      inputs.forEach(function (input) { if (!validateField(input) && !firstBad) firstBad = input; });
      if (firstBad) { firstBad.focus(); setStatus("Please fix the highlighted fields."); return; }

      var data = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), message: form.elements.message.value.trim() };
      var endpoint = (CONFIG.formEndpoint || "").trim();
      var email = (CONFIG.email || "").trim();
      var submit = $('button[type="submit"]', form);

      // 1) A form service is configured: really send it.
      if (/^https:\/\//i.test(endpoint)) {
        submit.disabled = true;
        setStatus("Sending…");
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          form.reset();
          setStatus("Thanks, your message was sent. I'll get back to you soon.", true);
        }).catch(function () {
          setStatus("Sorry, the message couldn't be sent. Please try again in a moment.");
        }).then(function () { submit.disabled = false; });
        return;
      }

      // 2) No form service, but an email address exists: hand off to the visitor's email app.
      if (email) {
        var href = "mailto:" + email +
          "?subject=" + encodeURIComponent("Portfolio inquiry from " + data.name) +
          "&body=" + encodeURIComponent(data.message + "\n\n" + data.name + "\n" + data.email);
        window.location.href = href;
        setStatus('Your email app should open with the message ready to send. If it doesn\'t, write to <a href="mailto:' + esc(email) + '">' + esc(email) + "</a>.", true);
        return;
      }

      // 3) Nothing configured yet: be honest about it.
      setStatus("Your message looks good, but this form isn't connected yet, so nothing was sent. (Site owner: add <code>formEndpoint</code> or <code>email</code> in js/config.js.)");
    });
  }

  /* ---------- Theme switch (dark / light) ---------- */
  function initTheme() {
    var root = document.documentElement, btn = $("#themeSwitch"), meta = $("#themeColor");
    if (!btn) return;

    function current() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
    function apply(theme) {
      if (theme === "light") root.setAttribute("data-theme", "light");
      else root.removeAttribute("data-theme");
      btn.setAttribute("aria-checked", String(theme === "light"));
      if (meta) meta.setAttribute("content", theme === "light" ? "#f7f3ea" : "#0a0a0b");
    }
    apply(current()); // sync the switch with the theme set in <head>

    btn.addEventListener("click", function () {
      var next = current() === "light" ? "dark" : "light";
      try { localStorage.setItem("theme", next); } catch (err) { /* private mode: just don't remember */ }

      if (reduced) { apply(next); return; }

      // Preferred: circular reveal that grows out of the switch
      if (document.startViewTransition) {
        var r = btn.getBoundingClientRect();
        var x = r.left + r.width / 2, y = r.top + r.height / 2;
        var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        root.style.setProperty("--tx", x + "px");
        root.style.setProperty("--ty", y + "px");
        root.style.setProperty("--tr", radius + "px");
        document.startViewTransition(function () { apply(next); });
        return;
      }

      // Fallback: a short cross-fade of colors
      root.classList.add("theme-fade");
      apply(next);
      setTimeout(function () { root.classList.remove("theme-fade"); }, 550);
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    var year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    initTheme();
    initSmoothScroll();
    if (App.renderProjects) App.renderProjects();
    initSocials();
    initNav();
    initAccordion();
    initTabs("skillTabs", filterSkills);
    initTabs("projectTabs", filterProjects);
    initProjects();
    initForm();

    if (App.initAnimations) App.initAnimations();
    else document.body.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

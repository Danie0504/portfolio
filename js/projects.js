/* ==========================================================================
   projects.js — YOUR PROJECTS LIVE HERE
   Add, remove, or edit objects in the PROJECTS array. The cards, the category
   filter buttons, and the details dialog are all generated from it.

   Each project supports:
     title        Project name
     category     Used for the filter buttons (any text; identical text groups together)
     description  One or two sentences
     tech         Array of technologies used
     gallery      Optional array of extra image paths, shown in the details dialog
     image        Path to a screenshot, e.g. "assets/images/projects/my-site.jpg"
                  (leave "" to show the placeholder artwork). 16:10 images look best.
     live         Live URL (leave "" to hide the button)
     github       Repository URL (leave "" to hide the button)
     placeholder  Set to true for sample cards; shows a "Placeholder" badge.
                  Delete this line (or set false) on real projects.
   ========================================================================== */

window.PROJECTS = [
  {
    title: "Hasan Store Website",
    category: "Web Development",
    description: "A storefront website for Hasan Store, a neighborhood shop selling hardware, school and home supplies, printing, and mobile load. It has a product browser with search, category filters and sorting, a services page with per-page printing prices, and a cart.",
    tech: [],
    image: "assets/images/projects/hasan-store-home.jpg",
    gallery: [
      "assets/images/projects/hasan-store-products.jpg",
      "assets/images/projects/hasan-store-services.jpg"
    ],
    live: "",
    github: ""
  },
  {
    title: "Christening & 1st Birthday Invitation",
    category: "Web Development",
    description: "An interactive digital invitation for a christening and first birthday, delivered as a web link. It features a photo header, animated floral and butterfly accents, and the event date and venue.",
    tech: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/christening-invitation.jpg",
    live: "",
    github: ""
  },
  {
    title: "Hasan Store Storefront Concept",
    category: "Digital Design",
    description: "A homepage design concept for Hasan Store in a bright blue and yellow brand style, with a hero banner, feature strip, and shop-by-category section.",
    tech: [],
    image: "assets/images/projects/hasan-store-concept.jpg",
    live: "",
    github: ""
  },
  {
    title: "Hasan Store Promotional Graphic",
    category: "Digital Design",
    description: "A square promotional graphic for Hasan Store showing its product lines: kids wear, footwear, men's shorts, snacks and candies, and shades and glasses.",
    tech: [],
    image: "assets/images/projects/hasan-store-promo.jpg",
    live: "",
    github: ""
  }
];

/* -------------------------------------------------------------------------
   Rendering (you normally don't need to edit below this line)
   ------------------------------------------------------------------------- */
(function () {
  "use strict";
  var App = (window.App = window.App || {});

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Only allow normal web links, so a typo can't produce a broken or unsafe href.
  function safeUrl(url) {
    return /^(https?:\/\/|mailto:)/i.test(url || "") ? url : "";
  }

  function mediaHtml(p) {
    if (p.image) {
      return '<img src="' + esc(p.image) + '" alt="Screenshot of ' + esc(p.title) + '" loading="lazy" decoding="async">';
    }
    return '<div class="ph"><span>Project image<br>16 : 10</span></div>';
  }

  var arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

  App.renderProjects = function () {
    var grid = document.getElementById("projectGrid");
    var tabs = document.getElementById("projectTabs");
    if (!grid) return;
    var projects = window.PROJECTS || [];

    grid.innerHTML = projects.map(function (p, i) {
      return (
        '<article class="project" tabindex="0" role="button" data-index="' + i + '" data-cat="' + esc(p.category) + '" aria-label="View details: ' + esc(p.title) + '">' +
          '<div class="project__media">' +
            (p.placeholder ? '<span class="project__badge">Placeholder</span>' : "") +
            mediaHtml(p) +
          "</div>" +
          '<div class="project__body">' +
            '<p class="project__cat">' + esc(p.category) + "</p>" +
            '<h3 class="project__title">' + esc(p.title) + "</h3>" +
            '<p class="project__desc">' + esc(p.description) + "</p>" +
            '<div class="project__foot">' +
              '<p class="project__tech">' + (p.tech || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</p>" +
              '<span class="project__go">' + arrow + "</span>" +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    if (!projects.length) {
      grid.innerHTML = '<p class="muted">Projects coming soon.</p>';
    }

    // Filter buttons, built from the categories actually in use
    if (tabs) {
      var cats = [];
      projects.forEach(function (p) { if (p.category && cats.indexOf(p.category) === -1) cats.push(p.category); });
      var html = '<span class="tabs__pill" aria-hidden="true"></span><button class="is-active" data-filter="all" aria-pressed="true">All</button>';
      cats.forEach(function (c) { html += '<button data-filter="' + esc(c) + '" aria-pressed="false">' + esc(c) + "</button>"; });
      tabs.innerHTML = html;
      if (cats.length < 2) tabs.style.display = "none";
    }
  };

  App.openProject = function (index) {
    var p = (window.PROJECTS || [])[index];
    var modal = document.getElementById("projectModal");
    if (!p || !modal) return;

    document.getElementById("modalMedia").innerHTML = mediaHtml(p);
    var gallery = document.getElementById("modalGallery");
    if (gallery) gallery.innerHTML = (p.gallery || []).map(function (src, n) {
      return '<img src="' + esc(src) + '" alt="' + esc(p.title) + ', screenshot ' + (n + 2) + '" loading="lazy" decoding="async">';
    }).join("");
    document.getElementById("modalCat").textContent = p.category || "";
    document.getElementById("modalTitle").textContent = p.title || "";
    document.getElementById("modalDesc").textContent = p.description || "";
    document.getElementById("modalTech").innerHTML = (p.tech || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");

    var links = "";
    var live = safeUrl(p.live), gh = safeUrl(p.github);
    if (live) links += '<a class="btn btn--primary btn--sm" href="' + esc(live) + '" target="_blank" rel="noopener"><span>Live project</span>' + arrow + "</a>";
    if (gh) links += '<a class="btn btn--ghost btn--sm" href="' + esc(gh) + '" target="_blank" rel="noopener"><span>GitHub</span>' + arrow + "</a>";
    if (!links && p.placeholder) links = '<p class="modal__note">No links added yet. Set "live" or "github" in js/projects.js.</p>';
    document.getElementById("modalLinks").innerHTML = links;

    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    if (App.lenis) App.lenis.stop();
  };
})();

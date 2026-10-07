# Abdanie Manalundong — Portfolio

A static, hand-coded portfolio: plain HTML, CSS, and JavaScript. No build step, no framework, and nothing to install. All content comes from the resume; anything the resume doesn't cover is a clearly marked placeholder.

## Run it

**Quickest:** double-click `index.html`. It works straight from the folder.

**Recommended in VS Code:**
1. Open the `portfolio` folder in VS Code (`File > Open Folder`).
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` > **Open with Live Server**. The page reloads whenever you save.

## Files

```
portfolio/
├── index.html            All page content and structure
├── css/
│   ├── style.css         Design tokens (colors, fonts), components, sections
│   ├── animations.css    Loader, entrance states, scroll reveals, keyframes
│   └── responsive.css    Tablet and mobile layouts
├── js/
│   ├── config.js         YOUR email, social links, contact-form endpoint
│   ├── projects.js       YOUR projects (edit the array at the top)
│   ├── animations.js     Motion system
│   ├── main.js           Navigation, menu, accordion, filters, dialog, form
│   └── vendor/lenis.min.js   Smooth-scroll library (bundled)
└── assets/
    ├── images/abdanie.jpg    Hero portrait
    ├── icons/favicon.svg
    └── fonts/                Sora, Inter, JetBrains Mono (bundled)
```

## What to replace

| What | Where |
| --- | --- |
| **Email address** | `js/config.js` > `email` |
| **Social links** (GitHub, LinkedIn, Facebook) | `js/config.js` > `socials` (fill in `url`, optionally `handle`) |
| **Contact form delivery** | `js/config.js` > `formEndpoint` (see below) |
| **Projects** | `js/projects.js` > `PROJECTS` array |
| **Project screenshots** | Save into `assets/images/projects/`, then set each project's `image` path |

Anything left empty shows as a clearly marked placeholder ("Add link", "Placeholder") instead of made-up details.

### Photo
The portrait is `assets/images/abdanie.jpg`. To swap it, save the new photo with the same file name. It's shown in a 4:5 frame; if the crop is off, adjust `object-position` under `.portrait__frame img` in `css/style.css` (first number moves left/right, second up/down).

### Projects
Open `js/projects.js` and edit the objects at the top. Each has `title`, `category`, `description`, `tech`, `image`, `live`, and `github`. Copy a block to add a project, delete one to remove it. Remove `placeholder: true` on real projects to drop the badge. The filter buttons are built automatically from the categories you use.

### Contact form
Messages are delivered to the address in `js/config.js` through [FormSubmit](https://formsubmit.co), a free form-forwarding service (a static site can't send email by itself).

**One-time step:** after the site is online, send yourself a test message through the form. FormSubmit emails an activation link to that address. Click it once, and every later message arrives in the inbox. Check spam if you don't see it.

To change the receiving address, edit both `email` and the address at the end of `formEndpoint`. If `formEndpoint` is emptied, the form opens the visitor's email app instead.

### Text content
All copy is in `index.html`, section by section, with comment banners (`HERO`, `ABOUT`, `EXPERIENCE`, ...). Skills are a list in the `SKILLS` section: copy an `<li>` and set its `data-cat` to `it`, `web`, `db`, `design`, or `admin`.

## Colors and fonts

Everything is driven by CSS variables at the top of `css/style.css`, in the `:root` block:

- `--accent` is the single accent color (amber). Change it and `--accent-soft` (same color at low opacity) to re-theme the site.
- `--bg`, `--text`, `--muted`, `--dim` control the dark palette.
- `--font-display` (Sora, headings), `--font-body` (Inter), `--font-mono` (JetBrains Mono, labels).

### Dark and light themes
The switch in the navigation bar flips between dark (default) and light, and the visitor's choice is remembered on their device. Both themes read the same variables:

- Dark values are in the `:root` block at the top of `css/style.css`.
- Light values are in the `:root[data-theme="light"]` block near the bottom of the same file.
- The light background gradient is the `--backdrop` variable in that light block: warm paper (`#fdfbf6` to `#ece5d6`) with an amber wash top-right and a cool mist bottom-left.
- To make light the default, change the small script in the `<head>` of `index.html` so it sets `data-theme="light"` unless the saved value is `dark`.

To use a different font, drop its `.woff2` into `assets/fonts/`, add an `@font-face` rule like the existing ones, and update the variable.

## How the animation works

- **CSS holds the states, JavaScript flips the switches.** Hidden and visible states live in `css/animations.css`. JavaScript only adds classes or sets CSS variables, so animations run on `transform` and `opacity` and stay smooth.
- **Page load:** the loader runs for about 1.4 seconds, then `<body>` gets the class `is-ready`, which plays the hero: letters rise one by one, text un-blurs, the portrait wipes in, the grid fades up.
- **Scroll reveals:** any element with `data-reveal` (or `data-reveal="blur"` for headings) animates in when it enters the screen. Add the attribute to new elements and they join in automatically.
- **One animation loop** in `js/animations.js` drives smooth scrolling, the mouse-following glow, the custom cursor, the scroll progress bar, the portrait parallax, the timeline line, and the active nav link.
- **Mouse-only effects** (custom cursor, magnetic buttons, portrait tilt, light inside cards) turn off on touch screens.
- **Reduced motion:** if a visitor's device asks for less motion, the loader, smooth scroll, and all movement are skipped and content simply appears.

Speeds and easing are the `--ease` and `--dur` variables in `:root`.

## Libraries

| Library | Purpose | Location |
| --- | --- | --- |
| [Lenis](https://github.com/darkroomengineering/lenis) 1.3 (MIT) | Smooth scrolling | `js/vendor/lenis.min.js` |

That's the only one. It and the fonts are bundled in the project, so the site makes no external requests and works offline. If Lenis is removed, the site falls back to normal scrolling.

## Deploy

**GitHub Pages**
1. Create a new repository on GitHub and upload the contents of this folder (`index.html` must be at the top level).
2. In the repository: **Settings > Pages > Build and deployment**. Set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
3. After a minute the site is live at `https://<your-username>.github.io/<repository-name>/`.

**Netlify (no Git needed):** go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `portfolio` folder onto the page.

**Vercel / Cloudflare Pages:** import the repository and deploy with no build command and the root folder as the output.

## Before you publish

- [ ] Add your email and social links in `js/config.js`
- [ ] Connect the contact form (or rely on the email fallback)
- [ ] Replace the placeholder projects and add screenshots
- [ ] Update the `<title>` and `<meta name="description">` in `index.html` if you want different wording

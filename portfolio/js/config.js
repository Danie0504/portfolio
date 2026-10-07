/* ==========================================================================
   config.js — YOUR CONTACT DETAILS LIVE HERE
   Edit this file to add your email, social links, and form service.
   Anything left empty shows on the site as a clearly marked placeholder.
   ========================================================================== */

window.PORTFOLIO_CONFIG = {
  // Your public email address, e.g. "hello@yourdomain.com".
  // While this is empty, the site shows an "Add your email" placeholder.
  email: "daniefrvr@gmail.com",

  // Contact form endpoint. The site has no backend, so a form service delivers
  // the messages. This uses FormSubmit (https://formsubmit.co), which forwards
  // every submission to the email address at the end of the URL.
  // IMPORTANT: the first message ever sent triggers a one-time activation email
  // from FormSubmit. Click the link in it, and delivery works from then on.
  // If this is left empty, the form opens the visitor's email app instead.
  formEndpoint: "https://formsubmit.co/ajax/daniefrvr@gmail.com",

  // Social / professional links. Fill in `url` (and optionally `handle`) to turn
  // a placeholder into a live link. Remove any you don't use, or add more.
  socials: [
    { label: "GitHub",   handle: "Danie0504", url: "https://github.com/Danie0504" },
    // TODO: replace this search link with your real profile URL (linkedin.com/in/...)
    { label: "LinkedIn", handle: "Ab Danie Manalundong", url: "https://www.linkedin.com/search/results/people/?keywords=Ab%20Danie%20Manalundong" },
    { label: "Facebook", handle: "abdanie.manalundong", url: "https://www.facebook.com/abdanie.manalundong" }
  ]
};

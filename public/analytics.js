// Plausible bootstrap (the official inline snippet, moved to a same-origin
// file so the page can run without inline scripts under the CSP).
window.plausible = window.plausible || function () {
  (plausible.q = plausible.q || []).push(arguments);
};
plausible.init = plausible.init || function (i) {
  plausible.o = i || {};
};
plausible.init();

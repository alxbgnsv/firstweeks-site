/* Landing progressive enhancement. Page is fully usable without this file. */
(function () {
  'use strict';

  // FAQ: single-open (native <details> already works; this just closes siblings).
  var faq = document.querySelector('.faq');
  if (faq) {
    faq.addEventListener('toggle', function (e) {
      var d = e.target;
      if (d.tagName === 'DETAILS' && d.open) {
        faq.querySelectorAll('details[open]').forEach(function (o) { if (o !== d) o.open = false; });
      }
    }, true);
  }

  // Ask-demo tabs: swap answer panels.
  var demo = document.querySelector('[data-ask-demo]');
  if (demo) {
    var tabs = demo.querySelectorAll('.ask-tab');
    var panels = demo.querySelectorAll('.ask-answer');
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
        panels.forEach(function (p) { p.hidden = true; });
        tab.setAttribute('aria-selected', 'true');
        panels[i].hidden = false;
      });
    });
  }

  // Mobile sticky CTA: reveal after the hero scrolls out (no CLS — fixed overlay).
  var sticky = document.querySelector('[data-sticky-cta]');
  var hero = document.querySelector('.hero');
  if (sticky && hero && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      sticky.classList.toggle('is-on', !entries[0].isIntersecting);
    }, { rootMargin: '-120px 0px 0px 0px' });
    io.observe(hero);
  }
})();

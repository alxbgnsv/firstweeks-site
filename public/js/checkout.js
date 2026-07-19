/* Checkout state machine (Stage 2 only — loaded when data-checkout-live).
 * Stripe/Paddle Elements mount into [data-stripe-mount]; wire in Stage 2.
 * No real payment logic here — this is the flow scaffold. */
(function () {
  'use strict';
  var root = document.querySelector('[data-checkout-live]');
  if (!root) return;

  var panels = {};
  root.querySelectorAll('[data-state]').forEach(function (p) { panels[p.dataset.state] = p; });

  function show(state) {
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== state; });
  }

  // ?plan=monthly swaps the summary (Stage 2 pricing wiring).
  var plan = new URLSearchParams(location.search).get('plan') || 'annual';
  if (plan === 'monthly') {
    root.querySelectorAll('[data-plan-summary] b').forEach(function (b) { b.textContent = 'FirstWeeks Monthly'; });
  }

  var email = '';
  var emailInput = panels.email && panels.email.querySelector('input[type=email]');

  root.querySelector('#co-continue') && root.querySelector('#co-continue').addEventListener('click', function () {
    email = (emailInput && emailInput.value) || '';
    // Stage 2: check for existing plan here → show('exists'). Default → payment.
    show('payment');
  });
  root.querySelector('#co-subscribe') && root.querySelector('#co-subscribe').addEventListener('click', function () {
    // Stage 2: confirm Stripe payment → success or declined.
    var em = root.querySelector('[data-success-email]');
    if (em) em.textContent = email || 'your email';
    show('success');
  });
  root.querySelector('#co-retry') && root.querySelector('#co-retry').addEventListener('click', function () { show('payment'); });
  root.querySelectorAll('[data-change]').forEach(function (b) {
    b.addEventListener('click', function () { show('email'); });
  });
})();

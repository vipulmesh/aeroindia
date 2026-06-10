/**
 * utilities.js — Aeroindia Shared Utilities
 */

/**
 * Delay execution of fn until delay ms after the last call.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 150) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Ensure fn is called at most once per delay ms.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function throttle(fn, delay = 100) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Shorthand for querySelector.
 * @param {string} selector
 * @param {Element|Document} scope
 * @returns {Element|null}
 */
export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * Shorthand for querySelectorAll — returns a real Array.
 * @param {string} selector
 * @param {Element|Document} scope
 * @returns {Element[]}
 */
export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Safe addEventListener helper.
 * @param {Element|Window|Document|null} el
 * @param {string} event
 * @param {Function} fn
 * @param {object|boolean} [options]
 */
export function on(el, event, fn, options) {
  if (!el) return;
  el.addEventListener(event, fn, options);
}

/**
 * Returns the current page filename (e.g. "about.html", "index.html").
 * @returns {string}
 */
export function getCurrentPage() {
  const path = window.location.pathname;
  const file = path.split('/').pop();
  return file || 'index.html';
}
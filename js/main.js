/**
 * main.js — Aeroindia Entry Point
 *
 * Responsibilities:
 *  - Inject shared nav HTML into #site-nav
 *  - Inject shared footer HTML into #site-footer
 *  - Initialize the loader screen
 *  - Bootstrap navigation, animations, and counters
 */

import { NAV_HTML, initNavigation } from './navigation.js';
import { initAnimations }           from './animations.js';
import { qs }                       from './utilities.js';

// ─── Footer HTML template ────────────────────────────────────────────────────
// ─── Footer HTML template fallback (for file:// protocol compatibility) ──────
const FOOTER_HTML = /* html */`
<footer class="relative border-t border-border bg-bg" role="contentinfo">
  <div class="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
      <div class="lg:col-span-2">
        <a href="index.html" class="inline-block mb-6" aria-label="Aeroindia — home">
          <div class="logo-plate logo-plate--footer">
            <img src="assets/aeroindia-logo.png" alt="Aeroindia" class="logo-img logo-footer" width="168" height="72" decoding="async">
          </div>
        </a>
        <p class="text-sm text-muted-text leading-relaxed max-w-xs">
          Engineering India's aerial future — UAV innovation for agriculture, healthcare, disaster response, and industry.
        </p>
        <p class="mt-4 font-mono text-[10px] uppercase tracking-label text-accent">नभः स्पृशतु तेजसा</p>
      </div>
      <div>
        <p class="section-label mb-6">Navigation</p>
        <ul class="space-y-3" role="list">
          <li><a href="index.html"    class="nav-link text-xs">Home</a></li>
          <li><a href="about.html"    class="nav-link text-xs">About</a></li>
          <li><a href="services.html" class="nav-link text-xs">Services</a></li>
          <li><a href="projects.html" class="nav-link text-xs">Projects</a></li>
          <li><a href="events.html"   class="nav-link text-xs">Events</a></li>
          <li><a href="contact.html"  class="nav-link text-xs">Contact</a></li>
          <li><a href="faq.html"      class="nav-link text-xs">FAQ</a></li>
        </ul>
      </div>
      <div>
        <p class="section-label mb-6">Contact</p>
        <ul class="space-y-3" role="list">
          <li><a href="mailto:aeroindia1402@gmail.com" class="nav-link text-xs hover:underline">aeroindia1402@gmail.com</a></li>
          <li><a href="contact.html" class="btn-primary text-xs mt-4 inline-flex">Request Demo</a></li>
        </ul>
        <div class="mt-8">
          <p class="section-label mb-3">Funded by</p>
          <p class="font-mono text-[10px] text-muted-text">RSCOE — ₹50,000</p>
        </div>
      </div>
    </div>
    <div class="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex flex-wrap items-center gap-6 font-mono text-[10px] uppercase tracking-label text-muted-text">
        <span>© <span id="footer-year">2026</span> Aeroindia.</span>
        <a href="privacy.html" class="hover:text-accent transition-colors duration-300">Privacy Policy</a>
        <a href="terms.html" class="hover:text-accent transition-colors duration-300">Terms of Service</a>
      </div>
          </div>
  </div>
</footer>
`;

// ─── Loader screen HTML ───────────────────────────────────────────────────────
const LOADER_HTML = /* html */`
<div class="loader-screen" id="loader-screen" role="status" aria-label="Loading Aeroindia">
  <div class="logo-plate logo-plate--loader">
    <img src="assets/aeroindia-logo.png" alt="Aeroindia" class="logo-img logo-loader" width="200" height="86" decoding="async">
  </div>
  <div class="loader-bar" aria-hidden="true"></div>
</div>
`;

// ─── Inject shared components ─────────────────────────────────────────────────
async function injectComponents() {
  const navSlot    = qs('#site-nav');
  const footerSlot = qs('#site-footer');

  // Inject Navigation
  if (navSlot) {
    try {
      const res = await fetch('components/header.html');
      if (res.ok) {
        navSlot.innerHTML = await res.text();
      } else {
        navSlot.innerHTML = NAV_HTML;
      }
    } catch (e) {
      navSlot.innerHTML = NAV_HTML;
    }
  }

  // Inject Footer
  if (footerSlot) {
    try {
      const res = await fetch('components/footer.html');
      if (res.ok) {
        footerSlot.innerHTML = await res.text();
      } else {
        footerSlot.innerHTML = FOOTER_HTML;
      }
    } catch (e) {
      footerSlot.innerHTML = FOOTER_HTML;
    }

    // Dynamic Copyright Year
    const yearEl = qs('#footer-year', footerSlot);
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear().toString();
    }
  }
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function initLoader() {
  const hasLoaded = sessionStorage.getItem('ai-loaded');

  if (!hasLoaded) {
    document.body.insertAdjacentHTML('afterbegin', LOADER_HTML);
    document.body.classList.add('is-loading');

    window.addEventListener('load', () => {
      const loader = qs('#loader-screen');
      if (!loader) return;

      setTimeout(() => {
        loader.classList.add('is-hidden');
        document.body.classList.remove('is-loading');
        sessionStorage.setItem('ai-loaded', '1');

        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      }, 900);
    });
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function init() {
  initLoader();
  await injectComponents();

  requestAnimationFrame(() => {
    initNavigation();
    initAnimations();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
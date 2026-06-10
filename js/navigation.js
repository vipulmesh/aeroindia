/**
 * navigation.js — Aeroindia Navigation Module
 *
 * Responsibilities:
 *  - Sticky navbar: add data-scrolled="true" on scroll past threshold
 *  - Show/hide navbar logo on scroll (navbar-logo visibility)
 *  - Mobile hamburger menu open/close
 *  - Mark active nav-link based on current page URL
 *  - Trap focus in open mobile menu (accessibility)
 *  - Close mobile menu on Escape key
 */

import { qs, qsa, on, throttle, getCurrentPage } from './utilities.js';

// ─── Constants ───────────────────────────────────────────────────────────────
const SCROLL_THRESHOLD = 60; // px before navbar gets data-scrolled
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// ─── Nav HTML template ───────────────────────────────────────────────────────
// Injected into #site-nav by main.js
export const NAV_HTML = /* html */`
<header id="navbar" role="banner">
  <nav class="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-10 lg:py-3.5" aria-label="Main navigation">

    <!-- Logo (slides in after scroll) -->
    <a href="index.html" class="navbar-logo shrink-0" aria-label="Aeroindia — home">
      <div class="logo-plate logo-plate--nav">
        <img src="assets/aeroindia-logo.png" alt="Aeroindia" class="logo-img logo-nav" width="88" height="34" decoding="async">
      </div>
    </a>

    <!-- Desktop links -->
    <ul class="hidden lg:flex items-center gap-8" role="list">
      <li><a href="index.html"    class="nav-link" data-page="index.html">Home</a></li>
      <li><a href="about.html"    class="nav-link" data-page="about.html">About</a></li>
      <li><a href="services.html" class="nav-link" data-page="services.html">Services</a></li>
      <li><a href="projects.html" class="nav-link" data-page="projects.html">Projects</a></li>
      <li><a href="events.html"   class="nav-link" data-page="events.html">Events</a></li>
    </ul>

    <!-- Desktop CTA -->
    <div class="hidden lg:flex items-center gap-6">
      <a href="contact.html" class="btn-secondary" data-page="contact.html">Contact Us</a>
    </div>

    <!-- Hamburger (mobile) -->
    <button
      id="hamburger"
      class="lg:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 shrink-0"
      aria-label="Open navigation menu"
      aria-expanded="false"
      aria-controls="mobile-menu">
      <span class="hamburger-line block h-px w-6 bg-foreground transition-all duration-300 origin-center"></span>
      <span class="hamburger-line block h-px w-6 bg-foreground transition-all duration-300 origin-center"></span>
      <span class="hamburger-line block h-px w-4 bg-foreground transition-all duration-300 origin-center self-end"></span>
    </button>
  </nav>
</header>

<!-- Mobile Menu Overlay -->
<div
  id="mobile-menu"
  role="dialog"
  aria-modal="true"
  aria-label="Navigation menu"
  class="fixed inset-0 z-[150] flex flex-col bg-bg"
  style="transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); visibility: hidden;">

  <div class="grain-overlay" aria-hidden="true"></div>

  <!-- Mobile menu header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
    <a href="index.html" aria-label="Aeroindia — home">
      <div class="logo-plate logo-plate--mobile">
        <img src="assets/aeroindia-logo.png" alt="Aeroindia" class="logo-img logo-mobile-menu" width="200" height="86" decoding="async">
      </div>
    </a>
    <button
      id="mobile-menu-close"
      class="flex items-center justify-center w-10 h-10 text-muted-text hover:text-accent transition-colors duration-300"
      aria-label="Close navigation menu">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M2 2L18 18M18 2L2 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>

  <!-- Mobile links -->
  <nav class="flex-1 flex flex-col justify-center px-6 py-8 overflow-y-auto" aria-label="Mobile navigation">
    <ul class="space-y-1" role="list">
      <li>
        <a href="index.html"    class="mobile-nav-link" data-page="index.html">
          <span class="font-mono text-[10px] text-accent tracking-label mr-3">01</span>Home
        </a>
      </li>
      <li>
        <a href="about.html"    class="mobile-nav-link" data-page="about.html">
          <span class="font-mono text-[10px] text-accent tracking-label mr-3">02</span>About
        </a>
      </li>
      <li>
        <a href="services.html" class="mobile-nav-link" data-page="services.html">
          <span class="font-mono text-[10px] text-accent tracking-label mr-3">03</span>Services
        </a>
      </li>
      <li>
        <a href="projects.html" class="mobile-nav-link" data-page="projects.html">
          <span class="font-mono text-[10px] text-accent tracking-label mr-3">04</span>Projects
        </a>
      </li>
      <li>
        <a href="events.html"   class="mobile-nav-link" data-page="events.html">
          <span class="font-mono text-[10px] text-accent tracking-label mr-3">05</span>Events
        </a>
      </li>
      <li>
        <a href="contact.html"  class="mobile-nav-link" data-page="contact.html">
          <span class="font-mono text-[10px] text-accent tracking-label mr-3">06</span>Contact
        </a>
      </li>
    </ul>
  </nav>

  <!-- Mobile footer strip -->
  <div class="px-6 py-6 border-t border-border shrink-0">
    <p class="font-mono text-[10px] uppercase tracking-label text-muted-text">
      नभः स्पृशतु तेजसा
    </p>
    <p class="mt-1 font-mono text-[10px] text-muted-text/50">aeroindia1402@gmail.com</p>
  </div>
</div>
`;

// ─── Initialise ───────────────────────────────────────────────────────────────
export function initNavigation() {
  const navbar      = qs('#navbar');
  const hamburger   = qs('#hamburger');
  const mobileMenu  = qs('#mobile-menu');
  const closeBtn    = qs('#mobile-menu-close');

  if (!navbar) return;

  // ── 1. Sticky scroll behaviour ──────────────────────────────────────────
  const onScroll = throttle(() => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    navbar.dataset.scrolled = String(scrolled);
  }, 80);

  on(window, 'scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // ── 2. Active nav link ───────────────────────────────────────────────────
  const page = getCurrentPage();
  qsa('[data-page]', navbar).forEach(link => {
    if (link.dataset.page === page) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
  qsa('[data-page]', mobileMenu).forEach(link => {
    if (link.dataset.page === page) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // ── 3. Mobile menu open / close ──────────────────────────────────────────
  function openMenu() {
    mobileMenu.style.transform = 'translateX(0)';
    mobileMenu.style.visibility = 'visible';
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Animate hamburger to X
    const lines = qsa('.hamburger-line', hamburger);
    if (lines[0]) lines[0].style.transform = 'translateY(6px) rotate(45deg)';
    if (lines[1]) lines[1].style.opacity = '0';
    if (lines[2]) {
      lines[2].style.width = '1.5rem';
      lines[2].style.transform = 'translateY(-9px) rotate(-45deg)';
      lines[2].style.alignSelf = '';
    }

    // Focus first focusable element in menu
    requestAnimationFrame(() => {
      const first = qs(FOCUSABLE, mobileMenu);
      if (first) first.focus();
    });
  }

  function closeMenu() {
    mobileMenu.style.transform = 'translateX(100%)';
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Restore hamburger lines
    const lines = qsa('.hamburger-line', hamburger);
    if (lines[0]) lines[0].style.transform = '';
    if (lines[1]) lines[1].style.opacity = '';
    if (lines[2]) {
      lines[2].style.width = '';
      lines[2].style.transform = '';
      lines[2].style.alignSelf = 'flex-end';
    }

    // Hide after transition
    mobileMenu.addEventListener('transitionend', () => {
      if (mobileMenu.style.transform === 'translateX(100%)') {
        mobileMenu.style.visibility = 'hidden';
      }
    }, { once: true });

    hamburger.focus();
  }

  on(hamburger, 'click', openMenu);
  on(closeBtn,  'click', closeMenu);

  // Close on backdrop click (outside menu panel)
  on(mobileMenu, 'click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // ── 4. Escape key closes menu ────────────────────────────────────────────
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  // ── 5. Focus trap inside open menu ──────────────────────────────────────
  on(mobileMenu, 'keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = qsa(FOCUSABLE, mobileMenu).filter(el => !el.closest('[aria-hidden="true"]'));
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
/**
 * animations.js — Aeroindia Animations Module
 *
 * Responsibilities:
 *  - IntersectionObserver for [data-reveal] — fade-in-up on viewport enter
 *  - IntersectionObserver for [data-stagger] / [data-stagger-item] — staggered children
 *  - Animated counters for [data-counter] with data-prefix / data-suffix
 *  - SVG trajectory path dash animation (hero paths)
 *  - Scroll indicator fade-out on scroll
 */

import { qsa, qs, on, throttle } from './utilities.js';

// ─── Shared observer options ──────────────────────────────────────────────────
const REVEAL_OPTIONS   = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
const STAGGER_OPTIONS  = { threshold: 0.10, rootMargin: '0px 0px -40px 0px' };
const COUNTER_OPTIONS  = { threshold: 0.5 };

// ─── 1. [data-reveal] — fade-in-up ───────────────────────────────────────────
function initReveal() {
  const els = qsa('[data-reveal]');
  if (!els.length) return;

  // Set initial state via inline style so it works without extra CSS
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.65s cubic-bezier(0.4,0,0.2,1), transform 0.65s cubic-bezier(0.4,0,0.2,1)';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    });
  }, REVEAL_OPTIONS);

  els.forEach(el => observer.observe(el));
}

// ─── 2. [data-stagger] / [data-stagger-item] — staggered children ────────────
function initStagger() {
  const containers = qsa('[data-stagger]');
  if (!containers.length) return;

  containers.forEach(container => {
    const items = qsa('[data-stagger-item]', container);
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const children = qsa('[data-stagger-item]', entry.target);
        children.forEach(child => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        });
        observer.unobserve(entry.target);
      });
    }, STAGGER_OPTIONS);

    observer.observe(container);
  });
}

// ─── 3. [data-counter] — animated number counters ────────────────────────────
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateCounter(el) {
  const target   = parseInt(el.dataset.counter, 10);
  const prefix   = el.dataset.prefix  || '';
  const suffix   = el.dataset.suffix  || '';
  const duration = 1400; // ms
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOutCubic(progress) * target);
    el.textContent = `${prefix}${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = qsa('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, COUNTER_OPTIONS);

  counters.forEach(el => observer.observe(el));
}

// ─── 4. SVG trajectory path dash animation ───────────────────────────────────
// Animates stroke-dashoffset for .trajectory-path elements in the hero
function initTrajectoryPaths() {
  const paths = qsa('.trajectory-path');
  if (!paths.length) return;

  paths.forEach(path => {
    try {
      const length = path.getTotalLength();
      path.style.strokeDasharray  = `${length * 0.15} ${length}`;
      path.style.strokeDashoffset = '0';
      // The CSS @keyframes dash animates dashoffset to -200 on a loop
      // We trigger it by adding the animation style here
      path.style.animation = `dash ${8 + Math.random() * 4}s linear infinite`;
    } catch (_) {
      // getTotalLength not supported — silently skip
    }
  });
}

// ─── 5. Scroll indicator fade-out ────────────────────────────────────────────
function initScrollIndicator() {
  const indicator = qs('[data-scroll-indicator]');
  if (!indicator) return;

  const onScroll = throttle(() => {
    const opacity = Math.max(0, 1 - window.scrollY / 180);
    indicator.style.opacity = String(opacity);
    indicator.style.pointerEvents = opacity < 0.1 ? 'none' : '';
  }, 60);

  on(window, 'scroll', onScroll, { passive: true });
}

// ─── Public init ─────────────────────────────────────────────────────────────
export function initAnimations() {
  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Still run counters and reveal instantly; skip transitions
    qsa('[data-reveal], [data-stagger-item]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    initCounters();
    return;
  }

  initReveal();
  initStagger();
  initCounters();
  initTrajectoryPaths();
  initScrollIndicator();
}
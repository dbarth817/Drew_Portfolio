(() => {
  'use strict';

  /* ========================================================================
     1. Theme Toggle (localStorage + prefers-color-scheme)
     ======================================================================== */
  const THEME_KEY = 'drew-barth-theme';
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('icon-sun');
  const moonIcon = document.getElementById('icon-moon');

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      const isDark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'block' : 'none';
        moonIcon.style.display = isDark ? 'none' : 'block';
      }
    }
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  /* ========================================================================
     2. Mobile Menu Drawer
     ======================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  function setMenuOpen(open) {
    if (!menuToggle || !mobileDrawer) return;
    mobileDrawer.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileDrawer.setAttribute('aria-hidden', String(!open));
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('is-open');
      setMenuOpen(!isOpen);
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (
        mobileDrawer.classList.contains('is-open') &&
        !mobileDrawer.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    });
  }

  /* ========================================================================
     3. Accessible Before / After Comparison Sliders
     ======================================================================== */
  const sliders = document.querySelectorAll('.compare-slider');

  sliders.forEach((slider) => {
    let currentPercent = Number(slider.getAttribute('aria-valuenow')) || 50;
    let isDragging = false;

    function updatePosition(percent) {
      const clamped = Math.max(0, Math.min(100, percent));
      currentPercent = Math.round(clamped * 10) / 10;
      slider.style.setProperty('--position', `${currentPercent}%`);
      slider.setAttribute('aria-valuenow', String(Math.round(currentPercent)));
    }

    function updateFromClientX(clientX) {
      const rect = slider.getBoundingClientRect();
      if (rect.width <= 0) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      updatePosition(pct);
    }

    slider.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isDragging = true;
      slider.setPointerCapture(e.pointerId);
      updateFromClientX(e.clientX);
    });

    slider.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      updateFromClientX(e.clientX);
    });

    const stopDragging = (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (slider.hasPointerCapture(e.pointerId)) {
        slider.releasePointerCapture(e.pointerId);
      }
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);

    slider.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 3;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          updatePosition(currentPercent - step);
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          updatePosition(currentPercent + step);
          break;
        case 'Home':
          e.preventDefault();
          updatePosition(0);
          break;
        case 'End':
          e.preventDefault();
          updatePosition(100);
          break;
        default:
          break;
      }
    });

    updatePosition(currentPercent);
  });

  /* ========================================================================
     4. Subtle Scroll Reveal (respecting prefers-reduced-motion)
     ======================================================================== */
  const revealEls = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  }
})();

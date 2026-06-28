/* ============================================================
   AZ-HIRE Recruitment Ltd — Landing page interactions
   ============================================================ */

(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 1) Header scroll state ---------- */
  const header = $('#siteHeader');
  const setHeaderState = () => {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  /* ---------- 2) Mobile menu ---------- */
  const nav = $('#nav');
  const menuToggle = $('#menuToggle');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close menu when a nav link is clicked
    $$('.nav a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- 3) Smooth scroll for anchor links ---------- */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const offset = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  /* ---------- 4) Active nav link on scroll ---------- */
  const sections = $$('section[id]');
  const navLinks = $$('.nav a');
  const setActiveLink = () => {
    const scrollPos = window.scrollY + 120;
    let activeId = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos && sec.offsetTop + sec.offsetHeight > scrollPos) {
        activeId = sec.id;
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) link.classList.add('is-active');
      else link.classList.remove('is-active');
    });
  };
  setActiveLink();
  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ---------- 5) Scroll-reveal animations ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          entry.target.style.setProperty('--d', `${delay}ms`);
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(el => revealObs.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- 6) Animated stat counters ---------- */
  const statNums = $$('.stat-num');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count || '0');
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const isInt = Number.isInteger(target);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (isInt ? Math.floor(value).toLocaleString() : value.toFixed(0)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = (isInt ? target.toLocaleString() : target) + suffix;
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(el => counterObs.observe(el));
  } else {
    statNums.forEach(el => {
      el.textContent = (parseFloat(el.dataset.count || '0')).toLocaleString() + (el.dataset.suffix || '');
    });
  }

  /* ---------- 7) Rotating hero word ---------- */
  const rotating = $('#rotatingWord');
  if (rotating) {
    const words = ['Top Talent', 'Ambitious People', 'Rising Leaders', 'Career Changers', 'Hidden Gems'];
    let idx = 0;
    setInterval(() => {
      rotating.style.opacity = '0';
      rotating.style.transform = 'translateY(-6px)';
      setTimeout(() => {
        idx = (idx + 1) % words.length;
        rotating.textContent = words[idx];
        rotating.style.transition = 'opacity 400ms var(--ease), transform 400ms var(--ease)';
        rotating.style.opacity = '1';
        rotating.style.transform = 'translateY(0)';
      }, 350);
    }, 2800);
  }

  /* ---------- 8) Contact form validation ---------- */
  const form = $('#contactForm');
  const formSuccess = $('#formSuccess');

  const validators = {
    firstName: (v) => v.trim().length >= 2 ? '' : 'Please enter your first name.',
    lastName:  (v) => v.trim().length >= 2 ? '' : 'Please enter your last name.',
    email:     (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email.',
    interest:  (v) => v ? '' : 'Please choose an option.',
    message:   (v) => v.trim().length >= 10 ? '' : 'Please tell us a bit more (10+ chars).',
  };

  const setFieldError = (field, msg) => {
    const wrap = field.closest('.field');
    const checkboxWrap = field.closest('.checkbox');
    const target = wrap || checkboxWrap;
    const err = wrap ? $('.field-error', wrap) : null;
    if (msg) {
      target?.classList.add('is-invalid');
      if (err) err.textContent = msg;
    } else {
      target?.classList.remove('is-invalid');
      if (err) err.textContent = '';
    }
  };

  if (form) {
    // Live validation on blur
    $$('input, select, textarea', form).forEach(field => {
      const v = validators[field.name];
      if (!v) return;
      const validate = () => setFieldError(field, v(field.value));
      field.addEventListener('blur', validate);
      field.addEventListener('input', () => {
        const target = field.closest('.field');
        if (target?.classList.contains('is-invalid')) validate();
      });
    });

    // Consent live
    const consent = $('#consent');
    consent?.addEventListener('change', () => {
      const wrap = consent.closest('.checkbox');
      if (consent.checked) wrap?.classList.remove('is-invalid');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstInvalid = null;
      let allValid = true;

      // Validate text/select fields
      Object.keys(validators).forEach(name => {
        const field = form.elements[name];
        if (!field) return;
        const msg = validators[name](field.value);
        setFieldError(field, msg);
        if (msg && !firstInvalid) firstInvalid = field;
        if (msg) allValid = false;
      });

      // Consent
      if (consent && !consent.checked) {
        consent.closest('.checkbox')?.classList.add('is-invalid');
        if (!firstInvalid) firstInvalid = consent;
        allValid = false;
      } else if (consent) {
        consent.closest('.checkbox')?.classList.remove('is-invalid');
      }

      if (!allValid) {
        firstInvalid?.focus();
        return;
      }

      // Simulated success — replace with real endpoint integration
      const submitBtn = $('button[type="submit"]', form);
      const label = $('.btn-label', submitBtn);
      const originalLabel = label?.textContent;

      submitBtn.disabled = true;
      if (label) label.textContent = 'Sending…';

      setTimeout(() => {
        form.reset();
        $$('.field', form).forEach(f => f.classList.remove('is-invalid'));
        $('.checkbox', form)?.classList.remove('is-invalid');
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (label) label.textContent = originalLabel;
        submitBtn.disabled = false;

        setTimeout(() => { formSuccess.hidden = true; }, 6000);
      }, 900);
    });
  }

  /* ---------- 9) Cursor follower (desktop only) ---------- */
  const dot = $('.cursor-dot');
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  if (dot && !isCoarse) {
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.classList.add('is-visible');
    });
    window.addEventListener('mouseleave', () => dot.classList.remove('is-visible'));

    const render = () => {
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;
      dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };
    render();

    $$('a, button, .bento-card, .process-step, .stat-card, .float-card').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('is-active'));
      el.addEventListener('mouseleave', () => dot.classList.remove('is-active'));
    });
  }

  /* ---------- 10) Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 11) Parallax blobs on hero (subtle) ---------- */
  const blobs = $$('.hero-bg .blob');
  if (blobs.length && !isCoarse) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      blobs.forEach((b, i) => {
        const f = (i + 1) * 0.4;
        b.style.translate = `${x * f}px ${y * f}px`;
      });
    }, { passive: true });
  }

  /* ---------- 12) Subtle tilt on hero cards ---------- */
  const cards = $$('.float-card');
  if (cards.length && !isCoarse) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const rx = ((cy / rect.height) - 0.5) * -8;
        const ry = ((cx / rect.width) - 0.5) * 8;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

})();
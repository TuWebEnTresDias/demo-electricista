(() => {
  'use strict';

  const params = new URLSearchParams(window.__DEMO_PARAMS__ ?? window.location.search);
  const rawCompany = (params.get('e') || params.get('n') || '').trim().slice(0, 80);
  const identity = rawCompany || 'Electricista';
  const safePhone = window.SiteSecurity && window.SiteSecurity.normalizePhone(
    params.has('t') ? params.get('t') : document.documentElement.dataset.defaultPhone
  );

  document.documentElement.classList.add('js');
  document.querySelectorAll('[data-dynamic="logo"],[data-dynamic="footer-name"],[data-dynamic="footer-small"]').forEach((node) => {
    node.textContent = identity;
  });
  document.title = identity + ' | Electricidad con criterio';
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = identity + ': instalaciones, mejoras y diagnóstico eléctrico con una mirada clara y cuidada.';

  const year = document.getElementById('currentYear');
  if (year) year.textContent = String(new Date().getFullYear());

  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const closeMenu = () => {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir navegación');
    mainNav.classList.remove('is-open');
  };
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
      mainNav.classList.toggle('is-open', open);
    });
    mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const form = document.getElementById('whatsappForm');
  const feedback = document.getElementById('formFeedback');
  const preparedMessageLink = document.getElementById('preparedMessageLink');
  const type = document.getElementById('serviceType');
  const message = document.getElementById('contactNeed');
  const name = document.getElementById('contactName');
  const zone = document.getElementById('contactZone');

  document.querySelectorAll('[data-service-select]').forEach((link) => {
    link.addEventListener('click', () => {
      if (type) type.value = link.dataset.serviceSelect;
    });
  });

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (!window.SiteSecurity || !window.SiteSecurity.contactAllowed() || !safePhone) {
        if (feedback) feedback.textContent = 'El contacto de esta demo no está disponible. Revisá el teléfono configurado antes de publicar.';
        return;
      }

      const parts = [
        'Hola, soy ' + ((name && name.value.trim()) || '____') + '.',
        'Me comunico desde la página de ' + identity + '.',
        'Quiero consultar por: ' + type.value + '.',
        'Zona: ' + ((zone && zone.value.trim()) || '____') + '.',
        'Situación: ' + message.value.trim()
      ];
      const url = new URL('https://wa.me/' + safePhone.whatsapp);
      url.searchParams.set('text', parts.join('\n'));
      if (preparedMessageLink) {
        preparedMessageLink.href = url.toString();
        preparedMessageLink.hidden = false;
      }
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
      if (feedback) {
        feedback.textContent = 'Listo: revisá el mensaje en WhatsApp y elegí enviarlo.';
      }
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));

    const processTrack = document.querySelector('.process-track');
    if (processTrack) {
      const processObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          processTrack.classList.add('is-visible');
          processObserver.disconnect();
        }
      }, { threshold: 0.28 });
      processObserver.observe(processTrack);
    }
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    document.querySelector('.process-track')?.classList.add('is-visible');
  }

  const hero = document.getElementById('hero');
  const heroMedia = document.querySelector('.hero-media');
  let framePending = false;
  const updateScrollScene = () => {
    if (!hero || !heroMedia) return;
    const range = Math.max(1, hero.offsetHeight * 0.9);
    const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / range));
    hero.style.setProperty('--scroll-progress', progress.toFixed(3));
    const currentPath = hero.querySelector('.current-path');
    if (currentPath) currentPath.style.strokeDashoffset = String(680 * (1 - progress));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const y = Math.round(progress * 25);
      const scale = 1.075 + progress * 0.025;
      heroMedia.style.transform = 'translate3d(0,' + y + 'px,0) scale(' + scale.toFixed(3) + ')';
    }
    framePending = false;
  };
  const onScroll = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateScrollScene);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScrollScene();
})();

(() => {
  'use strict';

  const localParams = new URLSearchParams(window.location.search);
  let params = localParams;
  if (!localParams.toString()) {
    try {
      if (window.parent && window.parent !== window) params = new URLSearchParams(window.parent.location.search);
    } catch (error) { /* Cross-origin parent: keep local defaults. */ }
  }

  const rawName = params.get('e') || params.get('n') || '';
  const identity = rawName.trim().slice(0, 80) || 'Electricista';
  document.querySelectorAll('[data-dynamic="logo"], [data-dynamic="footer-name"]').forEach((el) => {
    el.textContent = identity;
  });
  if (rawName.trim()) {
    document.title = `${identity} | Diagnóstico eléctrico claro`;
    const description = document.querySelector('meta[name="description"]');
      if (description) description.content = `${identity}: servicio eléctrico con rutas de falla, instalación e inspección.`;
  }

  const normalizeArgentinaPhone = (value) => {
    if (!value || !/^[+\d\s().-]+$/.test(value)) return null;
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('549')) digits = digits.slice(3);
    else if (digits.startsWith('54')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = digits.slice(1);
    if (digits.startsWith('15')) return null;
    return /^\d{10}$/.test(digits) ? digits : null;
  };
  const phone = normalizeArgentinaPhone(params.get('t') || '');
  const setText = (selector, text) => document.querySelectorAll(selector).forEach((el) => { el.textContent = text; });
  const intentMessages = {
    falla: `Hola, soy ____. Me comunico por el servicio eléctrico de ${identity}. Tengo una falla eléctrica: ocurre desde hace ____ y afecta ____. ¿Te parece conversar sobre el próximo paso?`,
    instalacion: `Hola, soy ____. Me comunico por el servicio eléctrico de ${identity}. Quiero consultar una instalación o mejora eléctrica. El espacio es ____ y necesito ____ .`,
    inspeccion: `Hola, soy ____. Me comunico por el servicio eléctrico de ${identity}. Quiero consultar una revisión eléctrica. Es una ____ y me preocupa ____ .`
  };
  if (phone) {
    const waPhone = `549${phone}`;
    const formatted = phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '$1 $2-$3');
    setText('[data-contact-heading]', 'Elegí cómo iniciar una consulta.');
    setText('[data-contact-copy]', 'Podés llamar o preparar un mensaje según el motivo. La disponibilidad y el alcance se confirman directamente; no se promete respuesta inmediata.');
    setText('[data-phone-display]', formatted);
    const call = document.querySelector('[data-call-link]');
    call.href = `tel:${phone}`;
    call.hidden = false;
    const wa = document.querySelector('[data-wa-link]');
    if (wa) {
      wa.href = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hola, quisiera consultar por el servicio eléctrico de ${identity}.`)}`;
      wa.target = '_blank';
      wa.rel = 'noopener noreferrer';
      wa.hidden = false;
    }
    document.querySelectorAll('[data-intent]').forEach((link) => {
      const intent = link.dataset.intent;
      if (!intentMessages[intent]) return;
      link.href = `https://wa.me/${waPhone}?text=${encodeURIComponent(intentMessages[intent])}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.hidden = false;
    });
  } else if (params.has('t')) {
    setText('[data-phone-display]', 'Número inválido · contacto desactivado');
  }

  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  const closeMenu = () => {
    if (!toggle || !nav) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Abrir navegación';
  };
  if (toggle && nav) toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Cerrar navegación' : 'Abrir navegación';
  });
  if (nav) nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });
  const year = document.getElementById('currentYear');
  if (year) year.textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealTargets = document.querySelectorAll('.service-detail, .steps, .safety, .faq, .contact');
    if (revealTargets.length) {
      document.body.classList.add('has-reveal');
      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      revealTargets.forEach((target) => observer.observe(target));
    }
  }
})();

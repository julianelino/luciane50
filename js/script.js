/* ============================================================
   js/script.js — Script principal compartilhado
   Luciane • 50 anos
   ============================================================ */

(function App() {
  'use strict';

  /* ---- Navbar: link ativo baseado na URL atual -------------------- */
  function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.navbar-link[data-page]');

    links.forEach(link => {
      const page = link.dataset.page;
      const isActive =
        (page === 'index'  && (currentPath === '' || currentPath === 'index.html')) ||
        (page === 'recado' && currentPath === 'recado.html') ||
        (page === 'mural'  && currentPath === 'mural.html')  ||
        (page === 'fotos'  && currentPath === 'fotos.html');

      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  /* ---- Toast de notificação -------------------------------------- */
  let toastTimer = null;

  function showToast(message, type = 'success') {
    let toast = document.getElementById('global-toast');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    // Limpa classes anteriores
    toast.className = 'toast';
    toast.classList.add(`toast--${type}`);
    toast.textContent = message;

    // Exibe
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Oculta após 3.5s
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('toast--visible');
    }, 3500);
  }

  /* ---- Section reveal com IntersectionObserver ------------------- */
  function initSectionReveal() {
    const sections = document.querySelectorAll('.section-reveal');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -20px 0px' }
    );

    sections.forEach(el => observer.observe(el));
  }

  /* ---- Prevenção de duplo-toque em iOS --------------------------- */
  function preventDoubleTapZoom() {
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) e.preventDefault();
      lastTap = now;
    }, { passive: false });
  }

  /* ---- Inicialização -------------------------------------------- */
  function init() {
    setActiveNavLink();
    initSectionReveal();
    preventDoubleTapZoom();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---- API pública ---------------------------------------------- */
  window.AppUtils = Object.freeze({ showToast });

})();

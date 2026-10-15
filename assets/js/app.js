/*
  assets/js/app.js
  Comportamento interativo do portfólio Dione Nascimento:
  - Ano automático no rodapé
  - Alternância de tema claro/escuro com persistência em localStorage
  - Filtro interativo de projetos por categoria tecnológica
  - Rolagem suave para navegação interna
*/

document.addEventListener('DOMContentLoaded', () => {
  // 1. Ano automático no rodapé
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Alternância de Tema Claro / Escuro
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const htmlTag = document.documentElement;

  // Carrega preferência anterior do usuário
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      htmlTag.classList.remove('dark');
      htmlTag.setAttribute('data-theme', 'light');
      if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
      htmlTag.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      if (htmlTag.classList.contains('dark')) {
        htmlTag.classList.remove('dark');
        htmlTag.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.textContent = 'light_mode';
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      } else {
        htmlTag.classList.add('dark');
        htmlTag.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = 'dark_mode';
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      }
    });
  }

  // 3. Filtro de Projetos Interativo
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      filterButtons.forEach((b) => {
        b.classList.remove('bg-primary-container', 'text-on-primary', 'font-semibold');
        b.classList.add('bg-surface-container', 'text-on-surface-variant');
      });
      btn.classList.add('bg-primary-container', 'text-on-primary', 'font-semibold');
      btn.classList.remove('bg-surface-container', 'text-on-surface-variant');

      projectCards.forEach((card) => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Scroll Suave para Âncoras
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});

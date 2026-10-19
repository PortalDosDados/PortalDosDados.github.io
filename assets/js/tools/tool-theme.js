/**
 * Alternância de tema claro/escuro compartilhada pelas páginas em ferramentas/.
 * Após aplicar o tema, emite o evento 'themechange' (detail.mode) para que
 * gráficos e outros componentes possam se redesenhar.
 */
document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const htmlTag = document.documentElement;

  const applyTheme = (mode) => {
    if (mode === 'light') {
      htmlTag.classList.remove('dark');
      htmlTag.setAttribute('data-theme', 'light');
      if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
      htmlTag.classList.add('dark');
      htmlTag.setAttribute('data-theme', 'dark');
      if (themeIcon) themeIcon.textContent = 'dark_mode';
    }
    document.dispatchEvent(new CustomEvent('themechange', { detail: { mode } }));
  };

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = htmlTag.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }
});

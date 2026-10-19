/** Prevenção de flash de tema (FOIT): aplica o tema salvo antes da renderização. */
try {
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
} catch (e) {}

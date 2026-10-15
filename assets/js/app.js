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

  // 5. Carrossel de Vídeos do YouTube
  const videoTrack = document.getElementById('videoCarouselTrack');
  const videoPrevBtn = document.getElementById('videoPrevBtn');
  const videoNextBtn = document.getElementById('videoNextBtn');
  const videoCounter = document.getElementById('videoCounter');

  if (videoTrack) {
    const cards = videoTrack.querySelectorAll('.video-card');
    const totalCards = cards.length;

    const updateCarouselState = () => {
      const scrollLeft = videoTrack.scrollLeft;
      const maxScroll = videoTrack.scrollWidth - videoTrack.clientWidth;
      
      if (videoPrevBtn) {
        videoPrevBtn.disabled = scrollLeft <= 10;
      }
      if (videoNextBtn) {
        videoNextBtn.disabled = scrollLeft >= maxScroll - 10;
      }

      if (videoCounter && totalCards > 0) {
        const firstCardWidth = cards[0]?.offsetWidth || 340;
        const activeIndex = Math.min(
          totalCards,
          Math.max(1, Math.round(scrollLeft / firstCardWidth) + 1)
        );
        videoCounter.textContent = `VÍDEO ${String(activeIndex).padStart(2, '0')} / ${String(totalCards).padStart(2, '0')}`;
      }
    };

    const getScrollStep = () => {
      if (cards.length > 0) {
        return cards[0].offsetWidth + 24; // largura do card + gap
      }
      return 360;
    };

    if (videoPrevBtn) {
      videoPrevBtn.addEventListener('click', () => {
        videoTrack.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      });
    }

    if (videoNextBtn) {
      videoNextBtn.addEventListener('click', () => {
        videoTrack.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      });
    }

    videoTrack.addEventListener('scroll', updateCarouselState, { passive: true });
    window.addEventListener('resize', updateCarouselState, { passive: true });
    updateCarouselState();
  }

  // 6. Player de Vídeo em Fachada (Click-to-Play Sob Demanda)
  document.querySelectorAll('.video-facade').forEach((facade) => {
    const playAction = () => {
      const videoId = facade.getAttribute('data-video-id');
      const videoTitle = facade.getAttribute('data-video-title') || 'Vídeo do YouTube';
      if (!videoId || facade.dataset.loaded === 'true') return;

      facade.dataset.loaded = 'true';
      facade.innerHTML = '';

      const iframe = document.createElement('iframe');
      iframe.setAttribute(
        'src',
        `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`
      );
      iframe.setAttribute('title', videoTitle);
      iframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      );
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.className = 'w-full h-full absolute inset-0 rounded-t-lg';
      facade.appendChild(iframe);
    };

    facade.addEventListener('click', playAction);
    facade.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playAction();
      }
    });
  });
});

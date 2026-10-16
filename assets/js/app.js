/*
  assets/js/app.js
  Comportamento interativo do portfólio Dione Nascimento:
  - Ano automático no rodapé
  - Alternância de tema claro/escuro com persistência em localStorage
  - Menu de navegação mobile responsivo
  - Destaque ativo de seção na barra de navegação (ScrollSpy)
  - Filtro interativo de projetos por categoria tecnológica
  - Rolagem suave para navegação interna
  - Carrossel de vídeos e fachada YouTube (Click-to-Play)
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

  const applyThemeUI = (mode) => {
    if (mode === 'light') {
      htmlTag.classList.remove('dark');
      htmlTag.setAttribute('data-theme', 'light');
      if (themeIcon) themeIcon.textContent = 'light_mode';
      if (themeBtn) themeBtn.setAttribute('aria-label', 'Ativar modo escuro');
    } else {
      htmlTag.classList.add('dark');
      htmlTag.setAttribute('data-theme', 'dark');
      if (themeIcon) themeIcon.textContent = 'dark_mode';
      if (themeBtn) themeBtn.setAttribute('aria-label', 'Ativar modo claro');
    }
  };

  try {
    const savedTheme = localStorage.getItem('theme');
    applyThemeUI(savedTheme === 'light' ? 'light' : 'dark');
  } catch (e) {
    applyThemeUI('dark');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const nextTheme = htmlTag.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyThemeUI(nextTheme);
      try {
        localStorage.setItem('theme', nextTheme);
      } catch (e) {}
    });
  }

  // 3. Menu de Navegação Mobile
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuIcon = document.getElementById('mobileMenuIcon');

  const closeMobileMenu = () => {
    if (!mobileMenu || !mobileMenuBtn) return;
    mobileMenu.classList.add('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
    if (mobileMenuIcon) mobileMenuIcon.textContent = 'menu';
  };

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileMenu();
      } else {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileMenuBtn.setAttribute('aria-label', 'Fechar menu de navegação');
        if (mobileMenuIcon) mobileMenuIcon.textContent = 'close';
      }
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  // 4. Destaque Ativo de Seção na Navbar (ScrollSpy)
  const navLinks = document.querySelectorAll('.nav-section-link');
  const observedSections = ['sobre', 'projetos', 'experiencia', 'habilidades', 'educacao', 'videos', 'contato']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActiveNavLink = (activeId) => {
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute('href') === `#${activeId}`;
      if (isMatch) {
        link.classList.add('text-primary', 'border-b-2', 'border-primary', 'pb-1');
        link.classList.remove('text-on-surface-variant');
      } else {
        link.classList.remove('text-primary', 'border-b-2', 'border-primary', 'pb-1');
        link.classList.add('text-on-surface-variant');
      }
    });
  };

  if ('IntersectionObserver' in window && observedSections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNavLink(entry.target.id);
          }
        });
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    );

    observedSections.forEach((sec) => observer.observe(sec));
  }

  // 5. Filtro de Projetos Interativo
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

  // 6. Scroll Suave para Âncoras
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

  // 7. Carrossel de Vídeos do YouTube
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
        return cards[0].offsetWidth + 24;
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

  // 8. Player de Vídeo em Fachada (Click-to-Play Sob Demanda)
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

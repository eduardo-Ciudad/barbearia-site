/* ============================================================
   NAV — scroll state
   ============================================================ */
const nav = document.getElementById('nav');

window.addEventListener('scroll', onScroll, { passive: true });

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 44);
  updateProgress(y);
}

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
const progressBar = document.getElementById('scrollProgress');

function updateProgress(y) {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  if (docH <= 0) return;
  const pct = Math.min((y / docH) * 100, 100);
  progressBar.style.width = pct + '%';
}

/* ============================================================
   HERO — entrance stagger on load
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    setTimeout(() => document.body.classList.add('is-loaded'), 60);
  });
});

/* ============================================================
   REVEAL — IntersectionObserver with stagger per parent
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const siblings = Array.from(
      el.parentElement.querySelectorAll(':scope > .reveal')
    );
    const idx = siblings.indexOf(el);
    const delay = Math.min(idx * 95, 380);

    setTimeout(() => el.classList.add('is-visible'), delay);
    revealObserver.unobserve(el);
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -36px 0px',
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   STAT COUNTER — animated count-up on scroll into view
   ============================================================ */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const isDecimal = !Number.isInteger(target);
  const duration = 1800;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = target * easeOutCubic(progress);
    el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.7 });

document.querySelectorAll('.stat__num[data-count]').forEach(el => {
  counterObserver.observe(el);
});

/* ============================================================
   RIPPLE — on every .btn click
   ============================================================ */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

/* ============================================================
   SMOOTH SCROLL — anchor links with nav offset
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

/* ============================================================
   GALLERY — lightbox
   ============================================================ */
document.querySelectorAll('.gallery__item img').forEach(img => {
  img.addEventListener('click', () => {
    const src = img.getAttribute('src');
    if (!src) return;
    openLightbox(src, img.getAttribute('alt') || '');
  });
});

function openLightbox(src, alt) {
  const existing = document.getElementById('lb-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'lb-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', alt || 'Imagem ampliada');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 500;
    background: rgba(11,11,11,0.96);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    opacity: 0; transition: opacity 0.28s ease;
    cursor: zoom-out;
  `;

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.style.cssText = `
    max-width: 100%; max-height: 90dvh;
    object-fit: contain; border-radius: 10px;
    transform: scale(0.92); transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
    pointer-events: none;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
  `;

  overlay.appendChild(img);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    img.style.transform = 'scale(1)';
  });

  const close = () => {
    overlay.style.opacity = '0';
    img.style.transform = 'scale(0.92)';
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
    }, 280);
  };

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handler);
    }
  });
}

/* ============================================================
   SERVICE CARDS — micro lift on hover to sync with CSS
   ============================================================ */
document.querySelectorAll('.service-card').forEach(card => {
  const btn = card.querySelector('.btn');
  if (!btn) return;
  card.addEventListener('mouseenter', () => { btn.style.setProperty('--hover-hint', '1'); });
  card.addEventListener('mouseleave', () => { btn.style.removeProperty('--hover-hint'); });
});

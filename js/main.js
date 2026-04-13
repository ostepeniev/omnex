/* ══════════════════════════════════════════════════════
   OMNEX — Main JavaScript
   ══════════════════════════════════════════════════════ */

// ── TELEGRAM BOT CONFIG ──
// Replace these values with your real bot token + chat/thread IDs
const TELEGRAM_CONFIG = {
  botToken: '8755751029:AAHUQTy0J8tAd8fcO1E6i4F_zSz01g1vG_Q',
  chatId: '-1003812673888',
  threadId: 114,
};

// ── NAV SCROLL EFFECT ──
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── SCROLL ANIMATIONS (IntersectionObserver) ──
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
}

// ── COUNTER ANIMATION ──
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));
}

// ── PRODUCT TABS ──
function initProductTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.product-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + id);
      if (panel) panel.classList.add('active');
    });
  });
}

// ── ROI CALCULATOR ──
function fmt(n) { return new Intl.NumberFormat('ru-RU').format(Math.round(n)); }

function updateCalc() {
  const empSlider = document.getElementById('emp-slider');
  const salSlider = document.getElementById('sal-slider');
  const rutSlider = document.getElementById('rut-slider');
  if (!empSlider) return;

  const emp = +empSlider.value;
  const sal = +salSlider.value;
  const rut = +rutSlider.value;

  document.getElementById('emp-val').textContent = emp;
  document.getElementById('sal-val').textContent = fmt(sal);
  document.getElementById('rut-val').textContent = rut + '%';

  const routine = emp * sal * (rut / 100);
  const save = routine * 0.7;
  const annualROI = ((save * 12 - 390) / 390 * 100);

  document.getElementById('res-routine').textContent = '€' + fmt(routine);
  document.getElementById('res-save').textContent = '€' + fmt(save);
  document.getElementById('res-roi').textContent = fmt(annualROI) + '%';
}

function initCalc() {
  ['emp-slider', 'sal-slider', 'rut-slider'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateCalc);
  });
  updateCalc();
}

// ── INTERACTIVE DEMO PANEL ──
function initDemoPanel() {
  document.querySelectorAll('.demo-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.panel;
      document.querySelectorAll('.demo-nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.demo-content-panel').forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      const panel = document.getElementById('demo-' + id);
      if (panel) panel.classList.add('active');
    });
  });
}

// ── FAQ ACCORDION ──
function initFaq() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all first
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── MOBILE MENU ──
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── LEAD CAPTURE MODAL ──
function initModal() {
  const overlay = document.getElementById('leadModal');
  if (!overlay) return;

  const form = document.getElementById('leadForm');
  const closeBtn = overlay.querySelector('.modal-close');
  const successEl = overlay.querySelector('.form-success');
  const formFields = overlay.querySelector('.form-fields');

  // Open modal
  document.querySelectorAll('[data-modal="lead"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Pre-select product if specified
      const product = btn.dataset.product;
      if (product) {
        const select = form.querySelector('select[name="product"]');
        if (select) select.value = product;
      }
    });
  });

  // Close modal
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // Reset after animation
    setTimeout(() => {
      if (successEl) successEl.classList.remove('show');
      if (formFields) formFields.style.display = '';
      if (form) form.reset();
    }, 300);
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  // Form submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('.form-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Відправляємо...';

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        await sendToTelegram(data);
        // Show success
        if (formFields) formFields.style.display = 'none';
        if (successEl) successEl.classList.add('show');
      } catch (err) {
        console.error('Telegram send error:', err);
        // Still show success to user (we don't want to expose errors)
        if (formFields) formFields.style.display = 'none';
        if (successEl) successEl.classList.add('show');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Відправити заявку →';
      }
    });
  }
}

// ── SEND TO TELEGRAM ──
async function sendToTelegram(data) {
  const { botToken, chatId, threadId } = TELEGRAM_CONFIG;

  if (botToken === 'YOUR_BOT_TOKEN' || chatId === 'YOUR_CHAT_ID') {
    console.warn('⚠️ Telegram bot not configured. Data:', data);
    return;
  }

  const productLabels = {
    'xray': 'AI X-Ray — €390',
    'pilot': 'OMNEX Pilot — €2,490',
    'core': 'OMNEX Core — €990/мес',
    'enterprise': 'Enterprise — Custom',
    'consult': 'Бесплатная консультация',
  };

  const now = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Prague' });

  let text = `🔔 *Нова заявка OMNEX*\n\n`;
  text += `👤 *Ім'я:* ${data.name || '—'}\n`;
  text += `🏢 *Компанія:* ${data.company || '—'}\n`;
  text += `📧 *Email:* ${data.email || '—'}\n`;
  text += `📱 *Телефон:* ${data.phone || '—'}\n`;
  text += `📦 *Продукт:* ${productLabels[data.product] || data.product || '—'}\n`;
  if (data.message) text += `💬 *Повідомлення:* ${data.message}\n`;
  text += `\n🕐 ${now}`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
  };
  if (threadId) body.message_thread_id = threadId;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }
}

// ── SMOOTH SCROLL FOR ANCHOR LINKS ──
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── PARTICLES (Hero Background) ──
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 40;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196, 241, 53, ${p.opacity})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(196, 241, 53, ${0.05 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
}

// ── INIT ALL ──
import { applyTranslations, initLanguageSwitcher } from './i18n.js';
import { createOctopusWidget } from './octopus.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initScrollAnimations();
  initCounters();
  initProductTabs();
  initCalc();
  initDemoPanel();
  initFaq();
  initMobileMenu();
  initModal();
  initSmoothScroll();
  initParticles();
  initLanguageSwitcher();
  applyTranslations();
  createOctopusWidget();
});

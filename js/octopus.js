/* ══════════════════════════════════════════════════════
   OMNEX — Octopus AI Assistant Widget
   Animated floating octopus + ChatGPT-powered dialog
   ══════════════════════════════════════════════════════ */

import { t, getLanguage } from './i18n.js';

// ── CONFIG ──
// Set VITE_OPENAI_API_KEY in .env.local or Vercel Environment Variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// System prompt loaded inline (can be fetched from file)
const SYSTEM_PROMPT = `Ти — OMNEX Octopus, розумний AI-помічник на сайті компанії OMNEX.

Хто ти:
Ти — дружній, але професійний AI-асистент що працює на сайті OMNEX. Твій стиль — коротко, метко, нативно продаючи послуги OMNEX. Ти не нав'язливий — ти корисний. Ти ставиш питання і ведеш до рішення.

Про OMNEX:
OMNEX — AI Operations Platform для середнього та великого бізнесу в Центральній та Східній Європі.
- Ми впроваджуємо AI-агентів в операційний центр бізнесу
- Вимірюваний результат за 14 днів
- GDPR compliant, дані в ЄС

Продукти OMNEX:
1. AI X-Ray — €390 (разово) — AI-рентген бізнесу. 20-сторінковий персональний звіт. Карта операційних втрат. Топ-3 можливості для AI. 30-хв дзвінок. Готово за 72 години. Гарантія повернення 7 днів.
2. OMNEX Pilot — €2,490 (разово) — 1 AI-агент. Інтеграція. 14 днів. Окупається за 3-6 тижнів.
3. OMNEX Core — від €990/міс — До 5 AI-агентів. Control Panel. Щотижневий ROI.
4. Enterprise — від €5,000/міс — Необмежено. Кастомно. On-premise.

Статистика: 47 компаній проаналізовано. €3,200 середньомісячні втрати SMB. 21× конверсія при 5-хв відповіді. 8× ROI від AI X-Ray.

Правила:
1. Відповідай КОРОТКО — 2-4 речення максимум
2. Завжди закінчуй питанням або CTA
3. Відповідай тією мовою якою запитали
4. Будь дружнім але професійним
5. Коли є нагода — згадай AI X-Ray за €390 як ідеальний перший крок
6. Використовуй емодзі помірно — 1-2 на повідомлення максимум
7. Використовуй SPIN selling: ситуаційні → проблемні → імплікаційні → питання потреби`;

let chatHistory = [];
let isOpen = false;

function createOctopusWidget() {
  // Container
  const widget = document.createElement('div');
  widget.id = 'octopusWidget';
  widget.innerHTML = `
    <div class="octo-float" id="octoFloat">
      <svg class="octo-svg-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="40" cy="28" rx="18" ry="20" fill="rgba(123,97,255,0.85)" stroke="rgba(196,241,53,0.6)" stroke-width="1.5"/>
        <circle cx="34" cy="25" r="3.5" fill="rgba(196,241,53,0.9)"/>
        <circle cx="46" cy="25" r="3.5" fill="rgba(196,241,53,0.9)"/>
        <circle cx="35" cy="25.5" r="1.5" fill="#0a0a0a"/>
        <circle cx="47" cy="25.5" r="1.5" fill="#0a0a0a"/>
        <path d="M28 44 Q18 56 16 68 Q15 73 20 72 Q24 71 25 65 Q27 56 32 48" stroke="rgba(196,241,53,0.7)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M35 46 Q33 58 34 70 Q35 74 39 73 Q42 72 41 67 Q40 58 39 48" stroke="rgba(196,241,53,0.7)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M45 46 Q47 58 46 70 Q45 74 41 73 Q38 72 39 67 Q40 58 41 48" stroke="rgba(196,241,53,0.7)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M52 44 Q62 56 64 68 Q65 73 60 72 Q56 71 55 65 Q53 56 48 48" stroke="rgba(196,241,53,0.7)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M24 36 Q14 38 10 34 Q7 30 12 29 Q16 28 22 32" stroke="rgba(123,97,255,0.5)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M56 36 Q66 38 70 34 Q73 30 68 29 Q64 28 58 32" stroke="rgba(123,97,255,0.5)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </svg>
      <div class="octo-pulse-ring"></div>
      <div class="octo-tooltip" id="octoTooltip">💬</div>
    </div>
    <div class="octo-chat" id="octoChat">
      <div class="octo-chat-header">
        <div class="octo-chat-avatar">
          <svg viewBox="0 0 32 32" fill="none"><ellipse cx="16" cy="12" rx="8" ry="9" fill="rgba(123,97,255,0.9)"/><circle cx="13" cy="10.5" r="1.5" fill="#C4F135"/><circle cx="19" cy="10.5" r="1.5" fill="#C4F135"/></svg>
        </div>
        <div>
          <div class="octo-chat-name">OMNEX Octopus</div>
          <div class="octo-chat-status">● Online</div>
        </div>
        <button class="octo-chat-close" id="octoChatClose">✕</button>
      </div>
      <div class="octo-chat-messages" id="octoChatMessages"></div>
      <div class="octo-chat-input-wrap">
        <input type="text" class="octo-chat-input" id="octoChatInput" placeholder="${t('widget.placeholder')}">
        <button class="octo-chat-send" id="octoChatSend">→</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // References
  const floatEl = document.getElementById('octoFloat');
  const chatEl = document.getElementById('octoChat');
  const closeBtn = document.getElementById('octoChatClose');
  const input = document.getElementById('octoChatInput');
  const sendBtn = document.getElementById('octoChatSend');
  const messagesEl = document.getElementById('octoChatMessages');
  const tooltip = document.getElementById('octoTooltip');

  // Toggle chat
  floatEl.addEventListener('click', () => {
    isOpen = !isOpen;
    chatEl.classList.toggle('open', isOpen);
    floatEl.classList.toggle('active', isOpen);
    tooltip.style.display = 'none';
    if (isOpen && chatHistory.length === 0) {
      addMessage('assistant', t('widget.greeting'));
    }
    if (isOpen) {
      setTimeout(() => input.focus(), 300);
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = false;
    chatEl.classList.remove('open');
    floatEl.classList.remove('active');
  });

  // Send message
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    // Show typing indicator
    const typingId = addMessage('assistant', t('widget.thinking'), true);

    try {
      chatHistory.push({ role: 'user', content: text });
      const reply = await callOpenAI(chatHistory);
      chatHistory.push({ role: 'assistant', content: reply });

      // Remove typing indicator and show real reply
      removeMessage(typingId);
      addMessage('assistant', reply);
    } catch (err) {
      console.error('OpenAI error:', err);
      removeMessage(typingId);
      addMessage('assistant', 'Вибачте, сталась помилка. Напишіть нам на hello@omnex.eu 📧');
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function addMessage(role, text, isTyping = false) {
    const id = 'msg-' + Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = `octo-msg octo-msg-${role}${isTyping ? ' octo-typing' : ''}`;
    div.id = id;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return id;
  }

  function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // Show tooltip after 3 seconds
  setTimeout(() => {
    if (!isOpen) {
      tooltip.style.display = 'flex';
      setTimeout(() => { if (!isOpen) tooltip.style.display = 'none'; }, 5000);
    }
  }, 3000);

  // Update placeholder on language change
  window.addEventListener('languageChanged', () => {
    input.placeholder = t('widget.placeholder');
  });
}

async function callOpenAI(messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export { createOctopusWidget };

/* ══════════════════════════════════════════════════════
   OMNEX — Questionnaire Logic
   Multi-step form with progress tracking, conditional
   logic, validation and Telegram submission.
   ══════════════════════════════════════════════════════ */

const TOTAL_BLOCKS = 6;
let currentBlock = 1;

function initQuestionnaire() {
  // Option click handling
  document.querySelectorAll('.q-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const input = opt.querySelector('input');
      if (!input) return;

      if (input.type === 'radio') {
        // Deselect siblings
        opt.closest('.q-options').querySelectorAll('.q-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        input.checked = true;
      } else if (input.type === 'checkbox') {
        input.checked = !input.checked;
        opt.classList.toggle('selected', input.checked);
      }

      // Check conditional logic
      checkConditionals();
    });
  });

  // Navigation
  document.querySelectorAll('.q-nav-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextBlock = +btn.dataset.next;
      if (validateBlock(currentBlock)) {
        goToBlock(nextBlock);
      }
    });
  });

  document.querySelectorAll('.q-nav-back').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevBlock = +btn.dataset.prev;
      goToBlock(prevBlock);
    });
  });

  // Submit
  const submitBtn = document.getElementById('qSubmitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      if (!validateBlock(currentBlock)) return;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Відправляємо...';

      try {
        const data = collectAllData();
        await sendQuestionnaireToTelegram(data);
        showCompletion();
      } catch (err) {
        console.error('Submit error:', err);
        showCompletion(); // Show success anyway
      }
    });
  }

  updateProgress();
}

function goToBlock(blockNum) {
  // Hide current
  const currentEl = document.getElementById(`block-${currentBlock}`);
  if (currentEl) {
    currentEl.classList.remove('active');
    currentEl.classList.add('completed');
  }

  currentBlock = blockNum;

  // Show or activate
  document.querySelectorAll('.q-block').forEach(b => {
    b.classList.remove('active', 'completed');
    const bNum = +b.dataset.block;
    if (bNum < blockNum) b.classList.add('completed');
    else if (bNum === blockNum) b.classList.add('active');
  });

  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
  const pct = Math.round(((currentBlock - 1) / TOTAL_BLOCKS) * 100);
  const fill = document.getElementById('qProgressFill');
  const text = document.getElementById('qProgressText');
  const pctEl = document.getElementById('qProgressPct');

  if (fill) fill.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;

  const blockNames = {
    1: 'Про компанію',
    2: 'Команда і структура',
    3: 'Операції та процеси',
    4: 'Продажі та клієнти',
    5: 'Поточні інструменти',
    6: 'Болі та пріоритети',
  };

  if (text) text.textContent = `Блок ${currentBlock} з ${TOTAL_BLOCKS} · ${blockNames[currentBlock] || ''}`;
}

function validateBlock(blockNum) {
  const block = document.getElementById(`block-${blockNum}`);
  if (!block) return true;

  const requiredQuestions = block.querySelectorAll('.q-question[data-required="true"]');
  let valid = true;

  requiredQuestions.forEach(q => {
    const type = q.dataset.type;
    let answered = false;

    if (type === 'text' || type === 'textarea') {
      const input = q.querySelector('.q-text-input');
      answered = input && input.value.trim().length > 0;
    } else if (type === 'radio') {
      answered = q.querySelector('input[type="radio"]:checked') !== null;
    } else if (type === 'checkbox') {
      answered = q.querySelector('input[type="checkbox"]:checked') !== null;
    } else if (type === 'contact') {
      const email = q.querySelector('[data-field="q42_email"]');
      const name = q.querySelector('[data-field="q42_name"]');
      answered = email && email.value.trim().length > 0 && name && name.value.trim().length > 0;
    }

    if (!answered) {
      valid = false;
      q.style.background = 'rgba(255,71,87,0.05)';
      q.style.borderRadius = '8px';
      q.style.padding = '16px';
      q.style.border = '1px solid rgba(255,71,87,0.2)';
      setTimeout(() => {
        q.style.background = '';
        q.style.border = '';
        q.style.padding = '';
      }, 3000);
    }
  });

  if (!valid) {
    const firstInvalid = block.querySelector('.q-question[style*="rgba(255,71,87"]');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

function checkConditionals() {
  document.querySelectorAll('.q-conditional').forEach(el => {
    const showIf = el.dataset.showIf;
    if (!showIf) return;

    const [field, value] = showIf.split('=');
    const checked = document.querySelector(`input[name="${field}"][value="${value}"]:checked`);
    el.classList.toggle('visible', !!checked);
  });
}

function collectAllData() {
  const data = {};

  // Text inputs
  document.querySelectorAll('.q-text-input[data-field], .form-select[data-field]').forEach(el => {
    if (el.value.trim()) data[el.dataset.field] = el.value.trim();
  });

  // Radio
  document.querySelectorAll('input[type="radio"]:checked').forEach(el => {
    data[el.name] = el.value;
  });

  // Checkboxes  
  const checkGroups = {};
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(el => {
    if (!checkGroups[el.name]) checkGroups[el.name] = [];
    checkGroups[el.name].push(el.value);
  });
  Object.entries(checkGroups).forEach(([k, v]) => {
    data[k] = v.join(', ');
  });

  return data;
}

async function sendQuestionnaireToTelegram(data) {
  const botToken = '8755751029:AAHUQTy0J8tAd8fcO1E6i4F_zSz01g1vG_Q';
  const chatId = '-1003812673888';
  const threadId = 114;

  const now = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Prague' });
  let text = `📋 *AI X-Ray Анкета*\n\n`;
  text += `👤 *Ім'я:* ${data.q42_name || '—'}\n`;
  text += `📧 *Email:* ${data.q42_email || '—'}\n`;
  text += `📱 *Телефон:* ${data.q42_phone || '—'}\n`;
  text += `🏢 *Компанія:* ${data.q1 || '—'}\n`;
  text += `🏭 *Галузь:* ${data.q2 || '—'}\n`;
  text += `📊 *Оборот:* ${data.q5 || '—'}\n`;
  text += `👥 *Команда:* ${data.q8 || '—'}\n`;
  text += `⏰ *Рутина/тижд:* ${data.q17 || '—'}\n`;
  text += `🎯 *Ціль:* ${data.q37 || '—'}\n`;
  text += `💰 *Бюджет AI:* ${data.q40 || '—'}\n`;
  text += `\n🕐 ${now}`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_thread_id: threadId,
      text,
      parse_mode: 'Markdown',
    }),
  });
}

function showCompletion() {
  // Hide all blocks
  document.querySelectorAll('.q-block').forEach(b => {
    b.style.display = 'none';
  });
  document.getElementById('qProgress').style.display = 'none';

  // Show completion
  const complete = document.getElementById('qComplete');
  if (complete) {
    complete.style.display = 'block';
    complete.scrollIntoView({ behavior: 'smooth' });
  }
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', initQuestionnaire);

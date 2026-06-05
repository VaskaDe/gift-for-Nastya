const content = window.GIFTOS_CONTENT;
const categories = content.categories;
const gifts = content.gifts;

let selectedGift = null;
let selectedCategory = null;
let selectedComment = '';
let finalText = '';
const $ = (id) => document.getElementById(id);

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value || '';
}

function applyEditableContent() {
  document.title = content.appTitle || 'GiftOS';

  setText('lockEyebrow', content.lockScreen.eyebrow);
  setText('lockTitle', content.lockScreen.title);
  setText('lockSubtitle', content.lockScreen.subtitle);
  setText('systemLabel', content.lockScreen.systemLabel);
  setText('systemTitle', content.lockScreen.systemTitle);
  setText('systemMeta', content.lockScreen.systemMeta);
  setText('unlockBtn', content.lockScreen.unlockButton);

  $('deprecatedList').setAttribute('aria-label', content.lockScreen.deprecatedTitle || 'Статус предыдущих версий');
  $('deprecatedList').innerHTML = content.lockScreen.deprecated.map(item => `
    <div><span>${item.version}</span><strong>${item.title}</strong><em>${item.status}</em></div>
  `).join('');

  setText('homeEyebrow', content.homeScreen.eyebrow);
  setText('homeTitle', content.homeScreen.title);
  setText('homeText', content.homeScreen.text);
  setText('questLabel', content.homeScreen.questLabel);
  setText('questTitle', content.homeScreen.questTitle);
  setText('questText', content.homeScreen.questText);
  setText('noGiftBtn', content.homeScreen.noGiftButton);

  setText('sheetEyebrow', content.bottomSheet.eyebrow);
  $('comment').placeholder = content.bottomSheet.commentPlaceholder;
  setText('confirmBtn', content.bottomSheet.confirmButton);
  setText('closeSheet', content.bottomSheet.closeButton);

  setText('toastTitle', content.toast.title);
  setText('toastText', content.toast.text);

  setText('successEyebrow', content.success.eyebrow);
  setText('successTitle', content.success.title);
  setText('successText', content.success.text);
  setText('sendTelegramBtn', content.success.telegramButton);
  setText('copyResultBtn', content.success.copyButton);
}

function updateClock() {
  const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  ['clock', 'clockHome'].forEach(id => { if ($(id)) $(id).textContent = time; });
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  $(id).classList.add('active');
  $(id).scrollTop = 0;
}

function renderCategories() {
  $('categoryGrid').innerHTML = categories.map(cat => `
    <button class="category category-${cat.id}" data-category="${cat.id}">
      <span class="category-glow"></span>
      <span class="emoji">${cat.emoji}</span>
      <strong>${cat.title}</strong>
      <small>${cat.desc}</small>
    </button>
  `).join('');
}

function renderGifts(categoryId) {
  selectedCategory = categories.find(cat => cat.id === categoryId);
  $('categoryTitle').textContent = selectedCategory.title;
  $('giftCards').innerHTML = gifts[categoryId].map((gift, index) => `
    <article class="gift-card gift-${categoryId}">
      <div class="card-art" aria-hidden="true">
        <span>${gift.icon || selectedCategory.emoji}</span>
      </div>
      <span class="tag">${gift.tag}</span>
      <h3>${gift.title}</h3>
      <p>${gift.text}</p>
      <button class="primary-button" data-gift-index="${index}">Выбрать</button>
    </article>
  `).join('');

  document.querySelectorAll('[data-gift-index]').forEach(button => {
    button.addEventListener('click', () => {
      selectedGift = gifts[categoryId][Number(button.dataset.giftIndex)];
      selectedCategory = categories.find(cat => cat.id === categoryId);
      openSheet(selectedGift);
    });
  });
}

function openSheet(gift) {
  $('sheetTitle').textContent = gift.title;
  $('sheetText').textContent = [gift.text, content.bottomSheet.extraLine].filter(Boolean).join(' ');
  $('comment').value = '';
  $('comment').placeholder = gift.commentPlaceholder || content.bottomSheet.commentPlaceholder;
  $('bottomSheet').classList.add('open');
  $('sheetBackdrop').classList.add('open');
  setTimeout(() => $('comment').focus({ preventScroll: true }), 120);
}

function closeSheet() {
  $('bottomSheet').classList.remove('open');
  $('sheetBackdrop').classList.remove('open');
}

function buildResultText() {
  const categoryTitle = selectedCategory?.title || '';
  const giftTitle = selectedGift?.title || '';
  const comment = selectedComment ? `\n${content.telegram.commentPrefix} ${selectedComment}` : '';
  return `${content.telegram.messagePrefix} ${giftTitle}\nКатегория: ${categoryTitle}${comment}`;
}

async function saveResultIfConfigured() {
  if (!content.submitEndpoint) return;
  try {
    await fetch(content.submitEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: selectedCategory?.title,
        gift: selectedGift?.title,
        comment: selectedComment,
        createdAt: new Date().toISOString(),
        source: 'giftos-nastya'
      })
    });
  } catch (error) {
    console.warn('Result was not saved to endpoint:', error);
  }
}

function showSuccess() {
  finalText = buildResultText();
  setText('resultCategory', `Категория: ${selectedCategory?.title || '—'}`);
  setText('resultGift', selectedGift?.title || '—');
  setText('resultComment', selectedComment || 'Без уточнений');
  showScreen('successScreen');
}

async function openTelegramWithResult() {
  const text = finalText || buildResultText();
  try {
    await navigator.clipboard.writeText(text);
    showToast('Результат скопирован', 'Открою Telegram. Останется вставить сообщение.');
    setTimeout(() => {
      window.location.href = `https://t.me/${content.telegram.username}`;
    }, 450);
  } catch {
    window.location.href = `https://t.me/${content.telegram.username}`;
  }
}

async function copyResult() {
  const text = finalText || buildResultText();
  try {
    await navigator.clipboard.writeText(text);
    showToast('Скопировано', 'Можно отправить результат вручную.');
  } catch {
    showToast('Не скопировалось', 'Открой Telegram-кнопку ниже.');
  }
}

function showToast(title, text) {
  setText('toastTitle', title || content.toast.title);
  setText('toastText', text || content.toast.text);
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 3200);
}

function placeNoGiftButtonRandomly() {
  const button = $('noGiftBtn');
  if (!button) return;
  const shell = document.querySelector('.phone-shell');
  const safeWidth = shell.clientWidth - button.offsetWidth - 28;
  const safeHeight = shell.clientHeight - button.offsetHeight - 110;
  const x = Math.max(14, Math.random() * Math.max(14, safeWidth));
  const y = Math.max(110, Math.random() * Math.max(110, safeHeight));
  button.style.left = `${x}px`;
  button.style.right = 'auto';
  button.style.bottom = 'auto';
  button.style.top = `${y}px`;
  button.classList.add('evade');
  setTimeout(() => button.classList.remove('evade'), 380);
}

function resetNoGiftButton() {
  const button = $('noGiftBtn');
  if (!button) return;
  button.style.left = '22px';
  button.style.right = '22px';
  button.style.top = 'auto';
  button.style.bottom = '24px';
}

function showNoGiftScreen(final = false) {
  const data = final ? content.noGift.final : content.noGift.first;
  setText('noGiftEyebrow', data.eyebrow);
  setText('noGiftTitle', data.title);
  setText('noGiftText', data.text);
  setText('returnToPicker', data.button);
  showScreen('noGiftScreen');
}

applyEditableContent();
updateClock();
setInterval(updateClock, 30000);
renderCategories();

$('unlockBtn').addEventListener('click', () => {
  document.querySelector('.hero-art')?.classList.add('unlocked');
  setTimeout(() => showScreen('homeScreen'), 520);
});

$('backToHome').addEventListener('click', () => showScreen('homeScreen'));
$('closeSheet').addEventListener('click', closeSheet);
$('sheetBackdrop').addEventListener('click', closeSheet);
$('backFromSuccess')?.addEventListener('click', () => showScreen('giftsScreen'));
$('sendTelegramBtn')?.addEventListener('click', openTelegramWithResult);
$('copyResultBtn')?.addEventListener('click', copyResult);

$('confirmBtn').addEventListener('click', async () => {
  if (!selectedGift) return;
  selectedComment = $('comment').value.trim();
  closeSheet();
  showToast(content.toast.title, content.toast.text);
  await saveResultIfConfigured();
  showSuccess();
});

$('categoryGrid').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  renderGifts(button.dataset.category);
  showScreen('giftsScreen');
});

let noGiftStage = 0;
let noGiftEvades = 0;

$('noGiftBtn')?.addEventListener('pointerenter', () => {
  if (noGiftEvades < 3) {
    noGiftEvades += 1;
    placeNoGiftButtonRandomly();
  }
});

$('noGiftBtn')?.addEventListener('click', () => {
  if (noGiftEvades < 3) {
    noGiftEvades += 1;
    placeNoGiftButtonRandomly();
    return;
  }
  noGiftStage += 1;
  resetNoGiftButton();
  noGiftEvades = noGiftStage === 1 ? 0 : 3;
  showNoGiftScreen(noGiftStage >= 2);
});

$('returnToPicker')?.addEventListener('click', () => {
  if (noGiftStage >= 2) {
    showScreen('lockScreen');
    return;
  }
  resetNoGiftButton();
  showScreen('homeScreen');
});

$('backFromNoGift')?.addEventListener('click', () => {
  resetNoGiftButton();
  showScreen('homeScreen');
});

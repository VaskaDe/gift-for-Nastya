import { appCopy } from '../data/catalog.js';
import { escapeHtml, nl2br } from '../utils/dom.js';
import { buildMessage } from '../services/submissionService.js';

export function progress(step) {
  const width = Math.max(8, Math.min(100, (step / 4) * 100));
  return `<div class="step">Step ${step} of 4 · ${appCopy.steps[step - 1] || 'GiftOS'}</div><div class="progress"><span style="width:${width}%"></span></div>`;
}

export function topbar(back = true, label = 'GiftOS') {
  return `<div class="topline">${back ? '<button class="back" data-action="back">‹</button>' : '<span></span>'}<span class="step">${label}</span><span></span></div>`;
}

export function introView() {
  return `<div class="screen hero">
    <div class="hero-art"><div class="orbit"></div><div class="orbit small"></div><div class="core"><span>22</span></div></div>
    <p class="eyebrow">${appCopy.intro.eyebrow}</p>
    <h1>${appCopy.intro.title}</h1>
    <p class="muted">${appCopy.intro.text}</p>
    <div class="panel"><span class="eyebrow">Инженерное решение</span><strong>${appCopy.intro.systemTitle}</strong><p>${appCopy.intro.systemMeta}</p></div>
    <div class="deprecated">${appCopy.intro.deprecated.map(([v,t,s]) => `<div><span>${v}</span><b>${t}</b><em>${s}</em></div>`).join('')}</div>
    <button class="btn primary" data-action="onboarding">Разблокировать подарок</button>
  </div>`;
}

export function onboardingView() {
  return `<div class="screen">
    ${topbar(true, 'Onboarding')}
    <p class="eyebrow">GiftOS protocol</p>
    <h2>Как работает система</h2>
    <p>Перед выбором — короткая инструкция. Это не тест и не обязательство. Можно смотреть, передумывать и уточнять.</p>
    <div class="onboarding">${appCopy.onboarding.map(([icon,title,text]) => `<div class="onboard-card"><span>${icon}</span><div><strong>${title}</strong><p>${text}</p></div></div>`).join('')}</div>
    <div class="build-log">Build status: passed<br>No critical bugs found<br>Awaiting user input...</div>
    <button class="btn primary" data-action="categories">Перейти к выбору</button>
  </div>`;
}

export function categoriesView(categories) {
  return `<div class="screen">
    ${topbar(false, 'Directions')}
    ${progress(1)}
    <div class="app-header"><p class="eyebrow">Gift picker</p><h2>Выбери направление</h2><p>Здесь больше не каталог подарков, а несколько сценариев. Каждый ведёт к отдельной логике выбора.</p></div>
    <div class="large-grid">${categories.map(c => `<button class="card" data-category="${c.id}"><div class="card-icon">${c.icon}</div><h3>${c.title}</h3><p>${c.short}</p></button>`).join('')}</div>
  </div>`;
}

export function categoryIntroView(category) {
  return `<div class="screen">
    ${topbar(true, category.title)}
    ${progress(2)}
    <div class="section-hero"><div class="big">${category.icon}</div><p class="eyebrow">${category.title}</p><h2>${category.short}</h2></div>
    <div class="quote">${nl2br(category.intro)}</div>
    ${category.wishlist ? wishlistViewInner() : `<button class="btn primary" data-action="variants">Открыть варианты</button>`}
  </div>`;
}

export function variantsView(category) {
  return `<div class="screen">
    ${topbar(true, category.title)}
    ${progress(2)}
    <p class="eyebrow">${category.title}</p>
    <h2>Выбери вариант</h2>
    <p>Можно выбрать приблизительно. Уточнение будет на следующем шаге.</p>
    <div class="options">${category.options.map(g => `<button class="option" data-gift="${g.id}"><span class="mark">${g.icon}</span><div><h3>${g.title}</h3><p>${g.text}</p></div><span class="chev">›</span></button>`).join('')}</div>
  </div>`;
}

export function detailsView(store) {
  const gift = store.gift;
  return `<div class="screen">
    ${topbar(true, 'Details')}
    ${progress(3)}
    <div class="panel choice-summary"><span>${gift.icon}</span><div><p class="eyebrow">${escapeHtml(store.category.title)}</p><h3>${escapeHtml(gift.title)}</h3><p>${escapeHtml(gift.text)}</p></div></div>
    <div class="details">
      <div class="panel"><strong>Быстрые отметки</strong><p>Можно выбрать несколько.</p><div class="chips">${gift.chips.map(chip => `<button class="chip ${store.selectedChips.has(chip) ? 'active' : ''}" data-chip="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`).join('')}</div></div>
      <div class="panel"><strong>Дополнительное уточнение</strong><textarea class="textarea" id="note" placeholder="${escapeHtml(gift.placeholder)}">${escapeHtml(store.note)}</textarea></div>
    </div>
    <button class="btn primary" data-action="confirm">Собрать финальный выбор</button>
  </div>`;
}

function wishlistViewInner() {
  return `<div class="wishlist-grid">
    <div class="wishlist-field"><strong>Название</strong><input id="wish-title" placeholder="Например: конкретная вещь или бренд" /></div>
    <div class="wishlist-field"><strong>Ссылка</strong><input id="wish-link" placeholder="https://..." /></div>
    <div class="wishlist-field"><strong>Размер</strong><input id="wish-size" placeholder="Если нужно" /></div>
    <div class="wishlist-field"><strong>Цвет</strong><input id="wish-color" placeholder="Если важен" /></div>
    <div class="wishlist-field"><strong>Комментарий</strong><textarea class="textarea" id="wish-comment" placeholder="Любые детали, чтобы Василий не включал самодеятельность"></textarea></div>
    <button class="btn primary" data-action="confirm-wishlist">Я всё сказала 😄</button>
  </div>`;
}

export function confirmationView(store) {
  const msg = buildMessage(store);
  return `<div class="screen">
    ${topbar(true, 'Confirmation')}
    ${progress(4)}
    <p class="eyebrow">Final build</p>
    <h2>Финальный выбор</h2>
    <p>Проверь, всё ли правильно. Можно вернуться назад и изменить детали.</p>
    <div class="result-box">
      ${store.category?.wishlist ? wishlistRows(store) : giftRows(store)}
    </div>
    <div class="build-log">Gift request compiled<br>Payload prepared<br>Executor: Vasiliy</div>
    <div class="actions"><button class="btn primary" data-action="submit">Отправить выбор Василию</button><button class="btn ghost" data-action="back">Вернуться назад</button></div>
  </div>`;
}

function giftRows(store) {
  return row('Категория', store.category?.title) + row('Вариант', store.gift?.title) + row('Отметки', [...store.selectedChips].join(', ') || 'Без отметок') + row('Комментарий', store.note || 'Без уточнений');
}
function wishlistRows(store) {
  const w = store.wishlist;
  return row('Категория', 'Уже знаю что хочу') + row('Название', w.title || 'Не указано') + row('Ссылка', w.link || 'Не указана') + row('Размер', w.size || 'Не указан') + row('Цвет', w.color || 'Не указан') + row('Комментарий', w.comment || 'Без комментария');
}
function row(label, value) { return `<div class="result-row"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value || '—')}</strong></div>`; }

export function successView() {
  return `<div class="screen hero">
    <div class="hero-art"><div class="orbit"></div><div class="orbit small"></div><div class="core"><span>✓</span></div></div>
    <p class="eyebrow">Request sent</p>
    <h1>Выбор готов</h1>
    <p class="muted">Теперь задача у исполнителя. Система свою часть выполнила.</p>
    <div class="build-log">Status: waiting for implementation<br>Priority: birthday-critical<br>QA: Nastya</div>
    <button class="btn primary" data-action="categories">Вернуться к выбору</button>
  </div>`;
}

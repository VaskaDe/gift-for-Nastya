import { appCopy } from '../data/catalog.js';

export function buildMessage(store) {
  if (store.category?.wishlist) {
    const w = store.wishlist;
    return [
      '🎁 GiftOS · новый выбор',
      '',
      'Категория: Уже знаю что хочу',
      w.title ? `Название: ${w.title}` : null,
      w.link ? `Ссылка: ${w.link}` : null,
      w.size ? `Размер: ${w.size}` : null,
      w.color ? `Цвет: ${w.color}` : null,
      w.comment ? `Комментарий: ${w.comment}` : null
    ].filter(Boolean).join('\n');
  }

  return [
    '🎁 GiftOS · новый выбор',
    '',
    `Категория: ${store.category?.title || '—'}`,
    `Вариант: ${store.gift?.title || '—'}`,
    store.selectedChips.size ? `Отметки: ${[...store.selectedChips].join(', ')}` : null,
    store.note ? `Комментарий: ${store.note}` : null
  ].filter(Boolean).join('\n');
}

export async function submitSelection(store) {
  const message = buildMessage(store);
  try {
    await navigator.clipboard?.writeText(message);
  } catch {}
  const link = `https://t.me/${appCopy.telegramUsername}`;
  window.open(link, '_blank');
  return message;
}

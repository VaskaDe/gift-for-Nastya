import { categories } from './data/catalog.js';
import { store, resetSelection } from './state/store.js';
import { $, haptic } from './utils/dom.js';
import { introView, onboardingView, categoriesView, categoryIntroView, variantsView, detailsView, confirmationView, successView } from './views/templates.js';
import { submitSelection } from './services/submissionService.js';

const view = $('#view');
const history = [];

function setClock() {
  const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  $('#clock').textContent = time;
}
setClock();
setInterval(setClock, 30000);

function navigate(screen, push = true) {
  if (push && store.screen !== screen) history.push(store.screen);
  store.screen = screen;
  render();
  haptic();
}

function back() {
  persistInputs();
  const previous = history.pop();
  if (previous) {
    store.screen = previous;
    render();
  } else {
    navigate('categories', false);
  }
}

function render() {
  view.scrollTop = 0;
  if (store.screen === 'intro') view.innerHTML = introView();
  if (store.screen === 'onboarding') view.innerHTML = onboardingView();
  if (store.screen === 'categories') view.innerHTML = categoriesView(categories);
  if (store.screen === 'category') view.innerHTML = categoryIntroView(store.category);
  if (store.screen === 'variants') view.innerHTML = variantsView(store.category);
  if (store.screen === 'details') view.innerHTML = detailsView(store);
  if (store.screen === 'confirmation') view.innerHTML = confirmationView(store);
  if (store.screen === 'success') view.innerHTML = successView();
  bindEvents();
}

function bindEvents() {
  view.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', async () => {
      const action = el.dataset.action;
      if (action === 'back') return back();
      if (action === 'onboarding') return navigate('onboarding');
      if (action === 'categories') { resetSelection(); return navigate('categories'); }
      if (action === 'variants') return navigate('variants');
      if (action === 'confirm') { persistInputs(); return navigate('confirmation'); }
      if (action === 'confirm-wishlist') { persistWishlist(); return navigate('confirmation'); }
      if (action === 'submit') {
        persistInputs();
        await submitSelection(store);
        return navigate('success');
      }
    });
  });

  view.querySelectorAll('[data-category]').forEach(el => {
    el.addEventListener('click', () => {
      resetSelection();
      store.category = categories.find(c => c.id === el.dataset.category);
      navigate('category');
    });
  });

  view.querySelectorAll('[data-gift]').forEach(el => {
    el.addEventListener('click', () => {
      store.gift = store.category.options.find(g => g.id === el.dataset.gift);
      store.selectedChips = new Set();
      store.note = '';
      navigate('details');
    });
  });

  view.querySelectorAll('[data-chip]').forEach(el => {
    el.addEventListener('click', () => {
      const value = el.dataset.chip;
      if (store.selectedChips.has(value)) store.selectedChips.delete(value);
      else store.selectedChips.add(value);
      render();
    });
  });
}

function persistInputs() {
  const note = $('#note');
  if (note) store.note = note.value.trim();
  persistWishlist();
}

function persistWishlist() {
  const map = {
    title: $('#wish-title'),
    link: $('#wish-link'),
    size: $('#wish-size'),
    color: $('#wish-color'),
    comment: $('#wish-comment')
  };
  Object.entries(map).forEach(([key, el]) => {
    if (el) store.wishlist[key] = el.value.trim();
  });
}

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

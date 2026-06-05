export const store = {
  screen: 'intro',
  onboardingSeen: false,
  category: null,
  gift: null,
  selectedChips: new Set(),
  note: '',
  wishlist: {
    title: '',
    link: '',
    size: '',
    color: '',
    comment: ''
  }
};

export function resetSelection() {
  store.gift = null;
  store.selectedChips = new Set();
  store.note = '';
  store.wishlist = { title: '', link: '', size: '', color: '', comment: '' };
}

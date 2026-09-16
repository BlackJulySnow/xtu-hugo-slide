(() => {
  const links = [...document.querySelectorAll('[data-category]')];
  const decks = [...document.querySelectorAll('[data-deck-category]')];
  const status = document.querySelector('.xtu-category-status');
  function filter() {
    const requested = window.location.hash.slice(1) || 'all';
    const selected = links.find(link => link.dataset.category === requested) || links[0];
    const category = selected.dataset.category;
    let count = 0;
    for (const deck of decks) {
      deck.hidden = category !== 'all' && deck.dataset.deckCategory !== category;
      if (!deck.hidden) count += 1;
    }
    for (const link of links) {
      if (link === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    status.textContent = `显示 ${count} 份汇报`;
  }
  window.addEventListener('hashchange', filter);
  filter();
})();

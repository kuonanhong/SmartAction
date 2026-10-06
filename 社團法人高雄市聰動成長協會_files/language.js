(() => {
  'use strict';
  const root = document.documentElement;
  const supported = ['zh-TW', 'zh-CN', 'en', 'fr', 'ja', 'es'];
  const storageKey = 'smartaction-language';
  const config = window.SmartActionI18n || {translations:{}};
  const explicit = root.dataset.pageLocale || 'zh-TW';
  const isVariant = root.dataset.localeVariant === 'true';
  function matchLanguage(tag) {
    const value = String(tag || '').toLowerCase();
    if (value.startsWith('zh')) return /hans|cn|sg/.test(value) ? 'zh-CN' : 'zh-TW';
    return supported.find(code => value === code || value.startsWith(code + '-')) || null;
  }
  function preferredLanguage() {
    for (const tag of navigator.languages || [navigator.language]) {
      const value = matchLanguage(tag);
      if (value) return value;
    }
    return 'en';
  }
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch (_) {}
  const query = new URLSearchParams(location.search).get('lang');
  const selected = isVariant ? explicit : matchLanguage(query) || matchLanguage(saved) || preferredLanguage();
  const dictionaries = config.translations || {};
  const dictionary = dictionaries[selected] || {};
  const tr = text => dictionary[text] || text;
  window.SmartActionLanguage = {locale:selected, tr, matchLanguage};
  if (!isVariant && selected !== 'zh-TW') {
    const walker = document.createTreeWalker(document, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (node.parentElement?.closest('script,style,[data-no-translate]')) return;
      const text = node.nodeValue.trim();
      if (dictionary[text]) node.nodeValue = node.nodeValue.replace(text, dictionary[text]);
    });
    document.querySelectorAll('[alt],[title],[placeholder],[aria-label]').forEach(el => {
      if (el.closest('[data-no-translate]')) return;
      for (const attribute of ['alt','title','placeholder','aria-label']) {
        const value = el.getAttribute(attribute);
        if (value && dictionary[value.trim()]) el.setAttribute(attribute, dictionary[value.trim()]);
      }
    });
    const description = document.querySelector('meta[name="description"]');
    if (description && dictionary[description.content]) description.content = dictionary[description.content];
  }
  root.lang = selected;
  root.dataset.activeLocale = selected;
  const translationNote = document.querySelector('.sa-locale-note');
  if (translationNote) translationNote.hidden = selected === 'zh-TW';
  function positionNavigation() {
    const barHeight = document.querySelector('.sa-language-bar')?.offsetHeight || 56;
    const noteHeight = translationNote?.offsetHeight || 0;
    const noticeHeight = document.querySelector('.sa-demo-notice')?.offsetHeight || 0;
    root.style.setProperty('--sa-language-height', barHeight + 'px');
    root.style.setProperty('--sa-notice-top', (barHeight + noteHeight) + 'px');
    root.style.setProperty('--sa-navigation-top', (barHeight + noteHeight + noticeHeight) + 'px');
  }
  positionNavigation();
  window.addEventListener('resize', positionNavigation);
  const selector = document.getElementById('sa-language-select');
  if (selector) {
    selector.value = selected;
    selector.addEventListener('change', () => {
      const choice = selector.value;
      try { localStorage.setItem(storageKey, choice); } catch (_) {}
      const base = new URL(root.dataset.siteRoot || './', location.href);
      const page = root.dataset.pagePath || 'index.html';
      const prefix = choice === 'zh-TW' || choice === 'auto' ? '' : choice + '/';
      const destination = new URL(prefix + page, base);
      destination.hash = location.hash;
      location.assign(destination.href);
    });
  }
  // In the automatic entry, make every internal navigation keep the chosen language.
  if (!isVariant && selected !== 'zh-TW') {
    const base = new URL(root.dataset.siteRoot || './', location.href);
    document.querySelectorAll('a[data-page-target]').forEach(link => {
      const original = new URL(link.href, location.href);
      const destination = new URL(selected + '/' + link.dataset.pageTarget, base);
      destination.hash = original.hash;
      link.href = destination.href;
    });
  }
  document.dispatchEvent(new CustomEvent('smartactionlanguage', {detail:{locale:selected}}));
})();

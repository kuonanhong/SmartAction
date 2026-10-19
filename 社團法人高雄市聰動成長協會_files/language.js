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

// SmartAction v5 · shortcuts to the sister apps in the language bar (appended; idempotent and defensive)
(() => {
  'use strict';
  try {
    const bar = document.querySelector('.sa-language-bar');
    if (!bar || bar.querySelector('.sa-portal-shortcut')) return;
    const root = document.documentElement;
    const labels = {
      'zh-TW': ['聰動太極拳', '無人機模擬飛行'],
      'zh-CN': ['聪动太极拳', '无人机模拟飞行'],
      en: ['SmartAction Tai Chi', 'Drone flight simulator'],
      fr: ['Tai-chi SmartAction', 'Simulateur de vol de drone'],
      ja: ['SmartAction 太極拳', 'ドローン飛行シミュレーター'],
      es: ['Taichí SmartAction', 'Simulador de vuelo de dron']
    };
    const tag = String(root.getAttribute('lang') || '').toLowerCase();
    let lang = 'en';
    if (tag.indexOf('zh') === 0) lang = /hans|cn|sg/.test(tag) ? 'zh-CN' : 'zh-TW';
    else ['fr', 'ja', 'es', 'en'].forEach(code => { if (tag === code || tag.indexOf(code + '-') === 0) lang = code; });
    // data-site-root is "./", "../" or "../../" …; anything else falls back to the depth of data-page-path.
    let base = root.getAttribute('data-site-root') || '';
    if (!/^(\.\/|(\.\.\/)+)$/.test(base)) {
      const page = String(root.getAttribute('data-page-path') || '');
      const depth = (page.match(/\//g) || []).length + (root.getAttribute('data-locale-variant') === 'true' ? 1 : 0);
      base = depth > 0 ? new Array(depth + 1).join('../') : './';
    }
    const index = location.protocol === 'file:' ? 'index.html' : '';
    const links = [
      ['taichi', base + 'taichi/' + index, labels[lang][0]],
      ['aero', 'https://kuonanhong.github.io/AERO_Explorer/', labels[lang][1]]
    ];
    const anchor = bar.querySelector('.sa-resource-shortcut');
    let after = anchor && anchor.parentNode === bar ? anchor : null;
    links.forEach(([id, href, text]) => {
      const a = document.createElement('a');
      a.className = 'sa-resource-shortcut sa-portal-shortcut';
      a.href = href; a.textContent = text; a.lang = lang;
      a.setAttribute('data-sa-shortcut', id); a.setAttribute('data-no-translate', '');
      if (after) bar.insertBefore(a, after.nextSibling);
      else bar.insertBefore(a, bar.querySelector('.sa-language-links'));
      after = a;
    });
    bar.classList.add('sa-has-portal-shortcuts');
    if (!document.getElementById('sa-portal-shortcut-style')) {
      const style = document.createElement('style');
      style.id = 'sa-portal-shortcut-style';
      style.textContent = '.sa-language-bar .sa-portal-shortcut{white-space:nowrap}' +
        '@media(max-width:760px){.sa-language-bar.sa-has-portal-shortcuts{flex-wrap:wrap;row-gap:4px}' +
        '.sa-language-bar .sa-portal-shortcut{max-width:none}}';
      (document.head || root).appendChild(style);
    }
    // language.js measured the bar before these links existed; let it re-measure the sticky offsets.
    window.dispatchEvent(new Event('resize'));
  } catch (_) { /* never break the page for an optional shortcut */ }
})();

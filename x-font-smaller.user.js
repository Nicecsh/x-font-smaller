// ==UserScript==
// @name         X.com 字体改小
// @namespace    sunny-x-font-smaller
// @version      1.1
// @description  把 X（x.com）网页版整体缩小显示；左侧抽屉菜单项的字号和间距各缩小一半
// @author       csh
// @date         2026-11-17
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // 整体缩放：0.95 是默认，越小字越小
  // 想再小一点改成 0.9 或 0.85，改完保存刷新页面生效
  const SCALE = 0.95;

  GM_addStyle('html { zoom: ' + SCALE + ' !important; }');

  // 左侧抽屉菜单：菜单项字号减半、上下间距减半
  // X 的 class 名每次构建都会变，没法用 class 定位，改按菜单文字匹配；
  // 字号和间距取当前实际渲染值乘以比例，不管 X 用多大字号都正好减半。
  // 改这两个数字调比例：0.5 就是减半，改成 0.6 就是缩小到原来的 60%
  const FONT_RATIO = 0.5;
  const SPACE_RATIO = 0.5;

  // 抽屉菜单项的文字（中文界面 + 英文界面都列上，命中哪个算哪个）
  const MENU_LABELS = [
    '个人资料', '现金', 'Premium', '列表', '社群', '历史',
    '创作者工作室', '广告', '书签', '设置', '帮助中心', '退出',
    'Profile', 'Lists', 'Communities', 'Bookmarks', 'History',
    'Creator Studio', 'Ads', 'Settings', 'Help Center', 'Log out'
  ];

  // 把元素的某个尺寸按比例缩小（读当前实际渲染值再算，取不到就不动）
  function scalePx(el, prop, ratio) {
    const v = parseFloat(getComputedStyle(el)[prop]);
    if (v > 0) el.style[prop] = (v * ratio) + 'px';
  }

  function shrinkMenuItems(root) {
    const links = (root || document).querySelectorAll('a[role="link"]');
    links.forEach(function (a) {
      if (a.dataset.menuShrunk) return; // 已处理过的不重复缩小
      const label = (a.textContent || '').trim();
      if (MENU_LABELS.indexOf(label) === -1) return;
      // 文字所在的最内层 span（字号以它为准）
      let textEl = null;
      a.querySelectorAll('span').forEach(function (s) {
        if (s.textContent.trim() === label) textEl = s;
      });
      scalePx(textEl || a, 'fontSize', FONT_RATIO);
      // 上下间距：链接本身和里面那层行的 padding 各减半
      scalePx(a, 'paddingTop', SPACE_RATIO);
      scalePx(a, 'paddingBottom', SPACE_RATIO);
      const row = a.firstElementChild;
      if (row) {
        scalePx(row, 'paddingTop', SPACE_RATIO);
        scalePx(row, 'paddingBottom', SPACE_RATIO);
      }
      scalePx(a, 'lineHeight', SPACE_RATIO);
      a.dataset.menuShrunk = '1';
    });
  }

  function start() {
    shrinkMenuItems(document);
    // X 是单页应用，抽屉菜单每次打开都会重新渲染，持续监听新出现的菜单项
    new MutationObserver(function () { shrinkMenuItems(document); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.documentElement) start();
  else document.addEventListener('DOMContentLoaded', start);
})();

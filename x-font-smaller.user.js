// ==UserScript==
// @name         X.com 字体改小
// @namespace    sunny-x-font-smaller
// @version      1.3
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
  // v1.3 改法：不再猜菜单项是什么标签，直接在页面里按文字找菜单名
  // （个人资料、Premium、列表……），找到就把字号用 !important 写死，
  // 不管 X 的样式怎么写都压得住。
  // 改这两个数字调比例：0.5 就是减半，改成 0.6 就是缩小到原来的 60%
  const FONT_RATIO = 0.5;
  const SPACE_RATIO = 0.5;

  // 调试提示：每次打开左侧菜单成功缩小后，屏幕下方短暂显示“已缩小 N 个菜单项”。
  // 如果打开菜单没出现这行提示，说明脚本没找到菜单项；确认生效后把 true 改成 false，提示就不再出现。
  const DEBUG_TOAST = true;

  // 抽屉菜单项的文字（中文界面 + 英文界面都列上，命中哪个算哪个）
  const MENU_LABELS = [
    '个人资料', '现金', 'Premium', '列表', '社群', '历史',
    '创作者工作室', '广告', '书签', '设置', '帮助中心', '退出',
    'Profile', 'Lists', 'Communities', 'Bookmarks', 'History',
    'Creator Studio', 'Ads', 'Settings', 'Help Center', 'Log out'
  ];

  // 把元素的某个尺寸按比例缩小（读当前实际渲染值再算，!important 压过 X 的样式）
  function scalePxImportant(el, prop, ratio) {
    const v = parseFloat(getComputedStyle(el)[prop]);
    if (v > 0) el.style.setProperty(prop, (v * ratio) + 'px', 'important');
  }

  function shrinkItem(item, textEl) {
    if (item.dataset.menuShrunk) return false; // 已处理过的不重复缩小
    scalePxImportant(textEl, 'fontSize', FONT_RATIO);
    scalePxImportant(item, 'fontSize', FONT_RATIO);
    scalePxImportant(item, 'paddingTop', SPACE_RATIO);
    scalePxImportant(item, 'paddingBottom', SPACE_RATIO);
    scalePxImportant(item, 'marginTop', SPACE_RATIO);
    scalePxImportant(item, 'marginBottom', SPACE_RATIO);
    const row = item.firstElementChild;
    if (row) {
      scalePxImportant(row, 'paddingTop', SPACE_RATIO);
      scalePxImportant(row, 'paddingBottom', SPACE_RATIO);
    }
    scalePxImportant(item, 'lineHeight', SPACE_RATIO);
    item.dataset.menuShrunk = '1';
    return true;
  }

  // 扫一遍页面所有文字节点，找菜单名
  function scan() {
    if (!document.body) return 0;
    let count = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const t = (node.nodeValue || '').trim();
      if (!t || MENU_LABELS.indexOf(t) === -1) continue;
      const textEl = node.parentElement;
      if (!textEl) continue;
      // 找到文字所在的那一整行（链接 / 按钮 / 行容器），找不到就用文字元素的父级
      const item = textEl.closest('a, [role="link"], [role="button"]') || textEl.parentElement || textEl;
      if (shrinkItem(item, textEl)) count++;
    }
    return count;
  }

  let toastTimer = null;
  function toast(msg) {
    if (!DEBUG_TOAST) return;
    let div = document.getElementById('x-menu-shrink-toast');
    if (!div) {
      div = document.createElement('div');
      div.id = 'x-menu-shrink-toast';
      div.style.cssText = 'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:999999;background:rgba(0,0,0,0.8);color:#fff;font-size:14px;padding:8px 14px;border-radius:20px;pointer-events:none;';
      document.body.appendChild(div);
    }
    div.textContent = msg;
    div.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { div.style.display = 'none'; }, 3000);
  }

  let scheduled = false;
  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () {
      scheduled = false;
      const n = scan();
      if (n > 0) toast('已缩小 ' + n + ' 个菜单项');
    }, 300);
  }

  function start() {
    scheduleScan();
    // X 是单页应用，抽屉菜单每次打开都会重新渲染，持续监听新出现的菜单项
    new MutationObserver(function (mutations) {
      if (mutations.some(function (m) { return m.addedNodes.length > 0; })) scheduleScan();
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();

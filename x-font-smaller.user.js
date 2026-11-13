// ==UserScript==
// @name         X.com 字体改小
// @namespace    sunny-x-font-smaller
// @version      1.0
// @description  把 X（x.com）网页版整体缩小显示，字体变小，时间线更紧凑
// @author       csh
// @date         2026-11-13
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // 改这个数字调大小：0.95 是默认，越小字越小
  // 想再小一点改成 0.9 或 0.85，改完保存刷新页面生效
  const SCALE = 0.95;

  GM_addStyle('html { zoom: ' + SCALE + ' !important; }');
})();

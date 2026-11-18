// ==UserScript==
// @name         X.com 字体改小
// @namespace    sunny-x-font-smaller
// @version      1.5
// @description  把 X（x.com）网页版整体缩小显示，并将移动版头像菜单的字号设为 11px、行高减半
// @author       csh
// @date         2026-11-18
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const SCALE = 0.95;
  const MENU_FONT_SIZE = 14.5;
  const ROW_RATIO = 0.5;
  const ORIGINAL_ROW_HEIGHT = 53; // X 默认菜单行高：23px 内容 + 上下各 15px 内边距。

  // 用账号切换器和导航链接定位头像菜单，覆盖动态插入的菜单项。
  const drawer = '[role="dialog"]:has(a[data-testid="switcher"])';
  const list = 'div:has(> div > a:is([href="/i/calls"], [data-testid="settings"], [data-testid="logout"]))';
  const row = `${drawer} ${list} > div > a[role="link"] > div:has(> svg[data-testid="icon"])`;

  GM_addStyle(`
    html { zoom: ${SCALE} !important; }

    ${row} {
      box-sizing: border-box !important;
      height: ${ORIGINAL_ROW_HEIGHT * ROW_RATIO}px !important;
      padding-block: 0 !important;
    }

    ${row} > div > span {
      font-size: ${MENU_FONT_SIZE}px !important;
    }
  `);
})();

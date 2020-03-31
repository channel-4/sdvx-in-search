// ==UserScript==
// @name         sdvx.in検索用スクリプト
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  右下に追加される検索
// @author       channel-4
// @match        https://sdvx.in/sort/*
// @grant        none
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

// (表示されている)曲についての情報を保存するオブジェクト
let Songs = {
  info: []
};

/**
 * 右下に固定の検索用のinputを追加する
 * @return {void}
 */
function addSearchBoxInBody() {

  // body末尾にboxを追加
  $('body').append(
    '<div class="search-box">検索 <input type="text" class="search"></div>'
  );

  // 検索のinputタグの親にあたるdivにスタイル適用
  $('.search-box').css({
    'position': 'fixed',
    'width': '90%',
    'max-width' : '250px',
    'bottom': '15px',
    'right': '10px',
    'text-align': 'center',
    'height': '50px',
    'line-height': '50px',
    'border-radius': '5px',
    'background': 'rgba(0, 0, 0, 0.8)',
    'color': '#fff'
  });

  // 検索用inputタグにスタイルを適用
  $('.search-box input').css({
    'width': '150px',
    'height': '20px',
    'padding': '5px 10px',
    'font-size': '15px',
    'border': 'solid 1px #ccc',
    'border-radius': '2px'
  });
}

/**
 * Songsオブジェクトのinfo配列に検索に必要な情報を保存する
 * @return {void}
 */
function saveSongInfosInDisplay() {
  // 全てのtrタグ取得
  const $tr_tags = $('tr');

  for (let i=0; i < $tr_tags.length; i++) {
    // 曲の表示・非表示のためのタグにあたるtrは子要素4つを持つ
    // 4つ持ってないものは保存しない
    if ($tr_tags[i].childElementCount !== 4) {
      continue;
    }

    // 表示・非表示にあたる要素
    const $tr = $tr_tags.eq(i)

    // name: 曲名
    Songs.info.push({
      name: $tr.children('td')[2].textContent,
      display_box: $tr
    });
  }
}

(function() {
  'use strict';

  // iframe内のcenterタグに要素が挿入されないように事前に削除しておく
  $('iframe').remove();

  // 画面上に列挙されている曲の情報取得(曲名, 表示・非表示する親のタグ要素)
  saveSongInfosInDisplay();

  // (広告を除く)要素全体にあたるcenterに対して検索用ボックスを挿入
  addSearchBoxInBody();

  const $input = $('.search');

  // 検索用のinputが動くたびに作動
  $input.on('input', function(){
    // inputに入っている値取得(前後の空白は除去する, 検索用に大文字統一)
    const input_val = $input.val().trim().toUpperCase();

    Songs.info.forEach(function(info_array) {
      const name = info_array.name.toUpperCase();
      const display_box = info_array.display_box;

      // 部分一致していれば表示, そうでなければ非表示
      if (name.indexOf(input_val) !== -1) {
        display_box.show();
      } else {
        display_box.hide();
      }
    });
  });
})();
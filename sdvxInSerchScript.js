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

// (表示されている)曲についての情報を格納
let Songs = {
  info: []
};

// 現在開いているページについて
let Page = {
    // syllabary: 50音順, level: レベル別ページ
    type: ''
}

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
 * 開いているページがどの種類か返す(50音順か、レベル別か)
 * @return {void}
 */
function getPageType() {
    // ex: /sort/sort_01.htm
    const pathname = location.pathname;

    // 「_」で区切った後、後者の値を「.」で区切って前者の値を取る
    // ex: /sort/sort_01.htm => 01.htm => 01
    let sort_type = pathname.split('_')[1].split('.')[0];

    // number型に変換してNaNが帰ってくる場合は50音順
    if (Number.isNaN(parseInt(sort_type))) {
      return 'syllabary';
    }

    // 数字が帰ってくる(= NaNでない)場合(1~20)はレベル別
    return 'level';
}

/**
 * Songsオブジェクトのinfo配列に検索に必要な情報を保存する
 * @return {void}
 */
function saveSongInfosInDisplay() {
  // 全てのtrタグ取得
  const $tr_tags = $('tr');

  // 曲名が入っているtdのindex番号
  const song_name_index = (Page.type === 'syllabary') ? 4 : 2;

  for (let i=0; i < $tr_tags.length; i++) {
    // 子要素の数
    const tr_child_count = $tr_tags[i].childElementCount;

    // 曲の表示・非表示のためのタグにあたるtrは50音順の時、8または9個
    // 8, 9以外の場合は対象外
    if (Page.type === 'syllabary' && tr_child_count !== 8 && tr_child_count !== 9) {
      continue;
    }

    // レベル別の場合は4個になる, 他は対象外
    if (Page.type === 'level' && tr_child_count !== 4) {
      continue;
    }

    // 表示・非表示にあたる要素
    const $tr = $tr_tags.eq(i);

    // name: 曲名
    Songs.info.push({
      name: $tr.children('td')[song_name_index].textContent,
      display_box: $tr
    });
  }
}

(function() {
  'use strict';

  // iframe内のcenterタグに要素が挿入されないように事前に削除しておく
  $('iframe').remove();

  // 50音順か、レベル別かを取得して格納
  Page.type = getPageType();

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
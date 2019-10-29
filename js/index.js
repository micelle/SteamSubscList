// セッションの呼び出し
const session_subscriptonsArray = getSessionStorage();
// ボタン（1ページ目ならボタンを追加。2ページ目以降でセッションがあれば自動処理を行う）
const button = document.createElement('button');
button.textContent = 'CSVダウンロード';
button.id = 'myworkshopfiles-dl';
button.className = 'pagebtn';
button.style.cssText = 'margin: 10px auto;';
button.onclick = function() {
  const txt =
    'サブスクライブ中のアイテムをCSVとして保存しますか？\n' +
    'ダウンロードを開始したい → OK\n' +
    'ダウンロードを中止したい → キャンセル\n' +
    '\n' +
    '※※注意※※\n' +
    '・ダウンロード中はブラウザに触れないで下さい。\n' +
    '・ページ数が多い場合は以下の操作をしてから行って下さい。\n' +
    '　1. 『30件ごと』の表示に変更して下さい\n' +
    '　2. 『ゲームでフィルタ』で絞り込みをしてください\n';
  const res = confirm(txt);
  if (res) saveSubscriptions();
};
const params = location.search.substring(1).split('&');
const buttonTrg = document.querySelector('.workshopBrowsePagingWithBG');
if (params.indexOf('p=1') >= 0 || !/&p=[0-9]/.test(location.search)) {
  buttonTrg.parentNode.insertBefore(button, buttonTrg.nextSibling);
  sessionStorage.removeItem('subscriptions'); // 初期化
} else if (session_subscriptonsArray.length > 0) {
  saveSubscriptions();
}
// セッションの保存＆次のページへ送る or CSVダウンロード
function saveSubscriptions() {
  // 最初に保存処理を行う
  const subscriptonsArray = getSubscriptions();
  const concat_subscriptonsArray = session_subscriptonsArray.concat(subscriptonsArray);
  sessionStorage.subscriptions = JSON.stringify(concat_subscriptonsArray);
  // 次のページへ送る or CSVダウンロード
  const pagebtns = document.querySelectorAll('.pagebtn');
  const lastPagebtn = pagebtns[pagebtns.length - 1];
  const className = lastPagebtn.classList.contains('disabled');
  if (!className) {
    lastPagebtn.click();
  } else {
    // https://macoblog.com/jquery-csv-download/
    // https://www.atmarkit.co.jp/ait/articles/1603/30/news026.html
    const array_data = [
      ['"game"', '"title"', '"url"']
    ].concat(concat_subscriptonsArray);
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const csv_data = array_data.map(function(l) {
      return l.join(',')
    }).join('\r\n');
    const blob = new Blob([bom, csv_data], {
      type: 'text/csv'
    });
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subscriptons.csv';
    link.click();
    sessionStorage.removeItem('subscriptions'); // 不要なので削除
    //alert('CSVのダウンロードが完了しました。');
  }
}
// サブスクライブの配列を取得
function getSubscriptions() {
  const subscriptions = document.querySelectorAll('div[id^="Subscription"]');
  const subscriptonsArray = Array.from(subscriptions).map(function(e) {
    const game = e.querySelector('.workshopItemApp').textContent.replace(/"/g, '""');
    const elm = e.querySelector('.workshopItemSubscriptionDetails > a');
    const txt = elm.textContent.replace(/"/g, '""');
    const url = elm.getAttribute('href');
    return [`"${game}"`, `"${txt}"`, `${url}`];
  });
  console.log('subscriptonsArray', subscriptonsArray);
  return subscriptonsArray;
}
// セッションの配列を取得
function getSessionStorage() {
  const session_subsc = sessionStorage.getItem('subscriptions');
  if (session_subsc == null) return []; // 1度も保存されていなければ空の配列を返す
  return JSON.parse(session_subsc);
}
# Kaleflower

_Kaleflower_ は、GUIベースでHTMLを編集するブロックエディタライブラリです。
断片化されたHTMLの部品(モジュール)をドラッグ＆ドロップ操作で組み合わせて、ウェブページを構成できます。

## インストール - Install

```
$ composer require broccoli-html-editor/kaleflower
```


## 更新履歴 - Change log

### Kaleflower v0.2.0 (リリース日未定)

- ドラッグ操作でインスタンスの幅と高さを編集できるようになった。
- データ構造変更: 各要素のスタイリング情報を、属性値ではなくCSSを直接操作するようになった。
- `layout`、 `contents-direction`、 `scrollable` を、`select` ボックスで選択できるようになった。
- `contents-direction` に `vertical` を追加。
- 要素の `onclick`, `onsubmit` 属性値を出力するようになった。
- クラス名を設定していない要素で、カスタムCSSを追加できるようになった。
- クラス名を設定していないスタイル要素を、CSS出力に含めるようになった。
- `module-name` が設定されている場合に、ルート要素にクラス名が出力されるようになった。
- オプション `finalize()` を追加。
- コンポーネントに `can-set-css` 属性を追加。
- フィールドに `format` を追加。デフォルトは `plain` とした。
- 単位付きの入力項目について、入力支援機能を追加。単位を別で選択できるようになった。
- ビューポート幅の変更機能を追加した。
- 小さい画面での操作性を向上した。
- レイアウトビューが、横スクロール操作に追従しない問題を修正。
- メディアクエリのCSSが、ベースクラスのスタイルがない場合に出力されない不具合を修正。
- その他、いくつかの不具合の修正、UIの改善など。

### Kaleflower v0.1.1 (2025年4月3日)

- 出力時の calss 名が正しく与えられない場合がある不具合を修正。
- ビルドオプション `extra` を追加した。
- コンポーネントに `_ENV.mode`、 `_ENV.lang`、 `_ENV.extra` が送られるようになった。
- コンポーネントに `<style>` を挿入できるようになった。
- インターフェイスの変更: `load()` と `build()` を分けた。
- `on()`, `off()`, `trigger()` を追加した。
- `onchange` イベントを追加した。
- その他の細かい不具合の修正など。

### Kaleflower v0.1.0 (2025年3月15日)

- Initial release.

## ライセンス - License

MIT License


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>

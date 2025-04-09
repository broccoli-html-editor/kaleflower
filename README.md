# Kaleflower

_Kaleflower_ は、GUIベースでHTMLを編集するブロックエディタライブラリです。
断片化されたHTMLの部品(モジュール)をドラッグ＆ドロップ操作で組み合わせて、ウェブページを構成できます。

## インストール - Install

```
$ composer require broccoli-html-editor/kaleflower
```


## 更新履歴 - Change log

### Kaleflower v0.1.2 (リリース日未定)

- `layout`、 `contents-direction`、 `scrollable` を、`select` ボックスで選択できるようになった。
- `contents-direction` に `vertical` を追加。

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

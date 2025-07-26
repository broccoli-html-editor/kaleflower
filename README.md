# Kaleflower

_Kaleflower_ は、GUIベースでHTMLを編集するブロックエディタライブラリです。
断片化されたHTMLの部品(モジュール)をドラッグ＆ドロップ操作で組み合わせて、ウェブページを構成できます。

## インストール - Install

```
$ composer require broccoli-html-editor/kaleflower
```

## 使い方 - Usage

### バックエンド（PHP）での初期化

#### 基本的な使用方法

```php
<?php
require_once('vendor/autoload.php');

// Kaleflowerインスタンスを作成
$kaleflower = new \kaleflower\kaleflower();

// kflowファイルを読み込み
$kaleflower->load('/path/to/your/file.kflow');

// HTML、CSS、JavaScriptを生成
$result = $kaleflower->build(array(
    'assetsPrefix' => './assets/',
));

// 結果の取得
if ($result->result) {
    echo $result->html->main;      // メインコンテンツのHTML
    echo $result->html->any;       // その他任意の部分のHTML（存在する場合）
    echo $result->css;             // 生成されたCSS
    echo $result->js;              // 生成されたJavaScript
    
    // アセットファイルの処理
    foreach ($result->assets as $asset) {
        // $asset->path: アセットのパス
        // $asset->base64: Base64エンコードされたアセットデータ
    }
} else {
    echo 'Error: ' . $result->error;
}
```

#### 一括処理（ファイル読み込みとビルドを同時実行）

```php
$result = $kaleflower->build('/path/to/your/file.kflow', array(
    'assetsPrefix' => './assets/',
));
```

#### XMLソースから直接読み込み

```php
$xmlSource = '<?xml version="1.0" encoding="UTF-8"?><kflow>...</kflow>';
$kaleflower->loadXml($xmlSource);
$result = $kaleflower->build();
```

### フロントエンド（JavaScript）での初期化

#### 基本的な使用方法

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kaleflower Editor</title>
</head>
<body>
    <div id="kaleflower-container"></div>
    
    <!-- Kaleflowerスクリプトを読み込み -->
    <script src="dist/kaleflower.js"></script>
    <script>
        // Kaleflowerエディタを初期化
        const container = document.getElementById('kaleflower-container');
        const kaleflower = new Kaleflower(container, {
            // 任意の初期化オプションを設定
        });

        // kflowファイルを読み込み
        kaleflower.load('/path/to/your/file.kflow');

        // 変更イベントの監視
        kaleflower.on('change', function(event) {
            console.log('Content changed:', event);
        });

        // 現在のデータを取得
        function saveContent() {
            const data = kaleflower.get();
            console.log('Current data:', data);
            // TODO: バックエンドへ送信して、kflowファイルを保存する処理
        }
    </script>
</body>
</html>
```

### オプション設定

#### バックエンド（PHP）のビルドオプション

| オプション名 | 型 | デフォルト値 | 説明 |
|-------------|----|-------------|------|
| `assetsPrefix` | string | `'./'` | アセットファイルのパスプレフィックス |
| `extra` | object | `{}` | コンポーネントテンプレートに渡される追加データ |

#### フロントエンド（JavaScript）の初期化オプション

| オプション名 | 型 | デフォルト値 | 説明 |
|-------------|----|-------------|------|
| `lang` | string | `'en'` | 言語設定（'en', 'ja' など） |
| `appearance` | string | `'auto'` | 外観テーマ（'light', 'dark', 'auto'） |
| `extra` | object | `{}` | コンポーネントテンプレートに渡される追加データ |
| `finalize` | function | `(contents) => contents` | 最終的なコンテンツをカスタマイズする関数 |
| `previewWrapSelector` | boolean/string | `false` | プレビューをラップするセレクタ |
| `urlLayoutViewPage` | string | `'about:blank'` | レイアウトビューのURL |
| `scriptReceiverSelector` | string | `'[data-kaleflower-receive-message=yes]'` | スクリプトメッセージ受信セレクタ |
| `contentsAreaSelector` | string | `'[data-kaleflower-contents-bowl-name]'` | コンテンツエリアセレクタ |
| `contentsContainerNameBy` | string | `'data-kaleflower-contents-bowl-name'` | コンテンツコンテナ名の属性 |

### kflowファイルの構造

kflowファイルはXML形式で、以下の要素で構成されます：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kflow>
    <!-- 設定 -->
    <configs>
        <config name="id" value="unique-id"/>
        <config name="module-name" value="module-name"/>
        <config name="module-name-prefix" value="prefix-"/>
        <config name="break-point-query-type" value="container-query"/>
        <config name="break-points">
            <value name="lg" max-width="1400"/>
            <value name="md" max-width="800"/>
            <value name="sm" max-width="480"/>
        </config>
        <config name="color-palettes">
            <value name="primary" color="#007bff"/>
            <value name="secondary" color="#6c757d"/>
        </config>
    </configs>
    
    <!-- スタイル定義 -->
    <styles>
        <style class="custom-class">
            color: #333;
            background-color: #fff;
        </style>
    </styles>
    
    <!-- コンテンツ -->
    <contents>
        <content name="main">
            <div>メインコンテンツ</div>
        </content>
        <content name="any">
            <div>任意の追加コンテンツ</div>
        </content>
    </contents>
    
    <!-- アセット（画像など） -->
    <assets>
        <asset id="unique-id" ext="jpg" size="1234" width="120" height="90" 
               is-private-material="false" public-filename="image.jpg" 
               base64="/9j/4QAYRXhpZgAASUkqAAgAAAAAAA......DL+bKpTi7+5//Z"/>
    </assets>
    
    <!-- カスタムフィールド -->
    <fields>
        <field type="custom-field" format="plain">
            <editor><![CDATA[<div class="test-field-text-editor">
                    <div class="test-field-text-editor__inner">
                        <textarea name="_" class="px2-input">{{ _ }}</textarea>
                        <div class="test-field-text-editor__color-sample"></div>
                    </div>
                </div>]]></editor>
            <style><![CDATA[.test-field-text-editor{&__color-sample{height:5px;}textarea{width:100%;}}]]></style>
            <style appearance="light"><![CDATA[.test-field-text-editor{&__color-sample{background-color:#666666;}}]]></style>
            <style appearance="dark"><![CDATA[.test-field-text-editor{&__color-sample{background-color:#f0f0f0;}}]]></style>
            <script function="onload"><![CDATA[function(dom, fieldHelper){
                console.log('custom-field: onload function:', dom, fieldHelper);
                return;
            }]]></script>
        </field>
    </fields>
    
    <!-- カスタムコンポーネント -->
    <components>
        <component name="custom-component" is-void-element="false" 
                   can-set-css="true" can-set-class="true">
            <fields>
                <field type="custom-field" name="title" label="タイトル"/>
            </fields>
            <template><![CDATA[
                <div class="custom-component">
                    <h2>{{ attributes.title }}</h2>
                    {{ innerHTML | raw }}
                </div>
            ]]></template>
        </component>
    </components>
</kflow>
```

### イベントハンドリング

```javascript
// 変更イベントの監視
kaleflower.on('change', function(event) {
    console.log('Content changed:', event.data);
});

// イベントハンドラの削除
kaleflower.off('change');

// カスタムイベントの発生
kaleflower.trigger('custom-event', { data: 'custom data' });
```

### データの保存と読み込み

```javascript
// 現在のデータを取得
const currentData = kaleflower.get();

// XMLデータを直接読み込み
const xmlData = '<?xml version="1.0" encoding="UTF-8"?><kflow>...</kflow>';
kaleflower.loadXml(xmlData);

// ファイルから読み込み
kaleflower.load('/path/to/file.kflow');
```


## 更新履歴 - Change log

### Kaleflower v0.2.1 (リリース日未定)

- imageフィールドに、「ウェブリソース」「なし」の選択を追加。
- フロントエンドの初期化オプションに `previewWrapSelector` を追加した。
- class名を与えたときに、元のスタイルが失われてしまう問題を修正した。
- カラーパレットから色選択できるようになった。
- `$kaleflower->getXml()` で、ブラウザとの互換性のため、LF改行コード `&#10;` を `&#xA;` に変換するようになった。
- その他、いくつかの不具合の修正、UIの改善など。

### Kaleflower v0.2.0 (2025年7月12日)

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
- config: `break-point-query-type` を追加。
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

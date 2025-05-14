const postcss = require('postcss');
const scss = require('postcss-scss');

/**
 * CssParser class
 * This class is used to parse and manipulate CSS styles.
 * It uses the postcss library to parse CSS and provides methods to get and set CSS properties.
 */
export class CssParser {

    /**
     * Constructor
     */
    constructor() {
        this.cssRoot = null;
        this.cssText = '';
    }

    /**
     * SCSSコードをセットする
     */
    set(cssText) {
        this.cssText = cssText || '';
        try {
            const result = postcss().process(this.cssText, { parser: scss });
            this.cssRoot = result.root;
        } catch (e) {
            console.error('SCSSのパースに失敗しました:', e);
            this.cssRoot = postcss.parse('');
        }
        return this;
    }

    /**
     * 編集済みのSCSSコードを取得する
     */
    get() {
        if (!this.cssRoot) {
            return this.cssText;
        }
        return this.cssRoot.toResult().css;
    }

    /**
     * 指定したプロパティの値を取得する
     */
    getProperty(propName) {
        if (!this.cssRoot) {
            return null;
        }

        let propValue = null;
        this.cssRoot.walkDecls(propName, (decl) => {
            propValue = decl.value;
            return false; // 最初に見つかったものを使用
        });

        return propValue;
    }

    /**
     * 指定したプロパティの値を上書きする
     */
    setProperty(propName, newValue) {
        if (!this.cssRoot) {
            return this;
        }

        let found = false;
        this.cssRoot.walkDecls(propName, (decl) => {
            decl.value = newValue;
            found = true;
        });

        // プロパティが見つからなかった場合は、最初のルールに追加
        if (!found && this.cssRoot.nodes && this.cssRoot.nodes.length > 0) {
            for (const node of this.cssRoot.nodes) {
                if (node.type === 'rule') {
                    node.append({ prop: propName, value: newValue });
                    found = true;
                    break;
                }
            }
        }

        // ルールがない場合、新しいルールを作成
        if (!found) {
            const newRule = postcss.rule({ selector: 'body' });
            newRule.append({ prop: propName, value: newValue });
            this.cssRoot.append(newRule);
        }

        return this;
    }
};

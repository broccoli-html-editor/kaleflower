const postcss = require('postcss');
const scss = require('postcss-scss');

/**
 * CssParser class
 * This class is used to parse and manipulate CSS styles.
 * It uses the postcss library to parse CSS and provides methods to get and set CSS properties.
 */
export class CssParser {

	#instance = null;
	#hasCssClassName = null;
	#breakPointName = null;
	#cssRoot = null;
	#cssText = '';

	/**
	 * Constructor
	 */
	constructor() {
		this.#cssRoot = null;
		this.#cssText = '';
	}

	/**
	 * SCSSコードをセットする
	 * 
	 * 対象となるDOM要素とCSSクラス情報、ブレークポイント名を設定し、
	 * 現在のCSSスタイルを解析してパーサーを初期化します。
	 * 
	 * @param {HTMLElement} instance - スタイルを設定する対象のDOM要素
	 * @param {boolean} hasCssClassName - CSSクラス名を持つかどうか
	 * @param {string|null} breakPointName - ブレークポイント名（レスポンシブ対応用）
	 * @return {CssParser} - メソッドチェーン用のインスタンス
	 */
	set(instance, hasCssClassName, breakPointName) {
		this.#instance = instance;
		this.#hasCssClassName = hasCssClassName;
		this.#breakPointName = breakPointName;

		const currentCssValue = (() => {
			if(!this.#hasCssClassName){
				const textContent = this.#instance.getAttribute(`style${this.#breakPointName ? '--'+this.#breakPointName : ''}`) || '';
				return textContent;
			}
			const textContent = Array.from(this.#instance.childNodes)
				.filter(node => node.nodeType === 3) // Filter for text nodes (nodeType 3)
				.map(node => node.textContent)
				.join('');
			return textContent;
		})();

		this.#cssText = currentCssValue;
		try {
			const result = postcss().process(this.#cssText, { parser: scss });
			this.#cssRoot = result.root;
		} catch (e) {
			console.error('Failed to parse SCSS:', e);
			this.#cssRoot = postcss.parse('');
		}
		return this;
	}

	/**
	 * 編集済みのSCSSコードを取得する
	 * 
	 * 編集されたCSSをフォーマットして文字列として取得し、
	 * DOM要素に適用します。スタイル属性または子テキストノードとして設定します。
	 * 
	 * @return {string} フォーマットされたCSSコード
	 */
	save() {
		if (!this.#cssRoot) {
			return this.#cssText;
			}
		
		// CSSをフォーマットする
		let newStyleSheet = '';
		this.#cssRoot.nodes.forEach(node => {
			if (node.type === 'decl') {
				// プロパティの場合は、セミコロンで終わり改行する
				newStyleSheet += `${node.prop}: ${node.value};` + "\n";
			} else {
				newStyleSheet += `${node.toString()}` + "\n";
			}
		});

		if(!this.#hasCssClassName){
			const styleAttrName = `style${this.#breakPointName ? '--'+this.#breakPointName : ''}`;
			this.#instance.setAttribute(styleAttrName, newStyleSheet);
			if(!newStyleSheet.trim().length){
				this.#instance.removeAttribute(styleAttrName);
			}
		}else{
			const textNodes = Array.from(this.#instance.childNodes)
				.filter(node => node.nodeType === 3);
			if (textNodes.length > 0) {
				// Replace content of the first text node
				textNodes[0].textContent = newStyleSheet;
				
				// Clear content of any additional text nodes
				for (let i = 1; i < textNodes.length; i++) {
					textNodes[i].textContent = '';
				}
			} else {
				// If no text nodes exist, create one and insert at the beginning
				const newTextNode = document.createTextNode(newStyleSheet);
				this.#instance.insertBefore(newTextNode, this.#instance.firstChild);
			}
		}

		return newStyleSheet;
	}

	/**
	 * 指定したプロパティの値を取得する
	 * 
	 * CSSルート内から指定されたプロパティ名の値を検索して返します。
	 * 複数ある場合は最初に見つかった値を返します。
	 * 
	 * @param {string} propName - 取得したいCSSプロパティ名
	 * @return {string|null} プロパティ値、見つからない場合はnull
	 */
	getProperty(propName) {
		if (!this.#cssRoot) {
			return null;
		}

		let propValue = null;
		this.#cssRoot.walkDecls(propName, (decl) => {
			propValue = decl.value;
			return false; // 最初に見つかったものを使用
		});

		return propValue;
	}

	/**
	 * 指定したプロパティの値を上書きする
	 * 
	 * CSSルート内の指定されたプロパティの値を新しい値で上書きします。
	 * 該当するプロパティが存在しない場合は新しく追加します。
	 * nullを指定した場合、プロパティを削除します。
	 * 
	 * @param {string} propName - 設定したいCSSプロパティ名
	 * @param {string|null} newValue - 新しいプロパティ値、nullの場合はプロパティを削除
	 * @return {CssParser} - メソッドチェーン用のインスタンス
	 */
	setProperty(propName, newValue) {
		if (!this.#cssRoot) {
			return this;
		}

		// newValueがnullの場合は、プロパティを削除する
		if (newValue === null || newValue === undefined || newValue === '') {
			// ルートノードから直接プロパティを削除
			this.#cssRoot.nodes = this.#cssRoot.nodes.filter(decl => {
				return decl.type !== 'decl' || decl.prop !== propName;
			});
			
			// 他の場所にあるプロパティも削除（例：メディアクエリ内など）
			this.#cssRoot.walkDecls(propName, (decl) => {
				decl.remove();
			});
			
			return this;
		}

		// newValueがnull以外の場合は通常の処理
		let found = false;
		this.#cssRoot.nodes.forEach((decl) => {
			if(decl.type != 'decl'){
				return;
			}
			if(decl.prop == propName){
				decl.value = newValue;
				found = true;
			}
		});

		this.#cssRoot.walkDecls(propName, (decl) => {
			decl.value = newValue;
			found = true;
		});

		// プロパティが見つからなかった場合は、追加する
		if (!found) {
			const newDecl = postcss.decl({ prop: propName, value: newValue });
			this.#cssRoot.append(newDecl);
		}

		return this;
	}
};

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
			this.#instance.setAttribute(`style${this.#breakPointName ? '--'+this.#breakPointName : ''}` || '', newStyleSheet);
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
	 */
	setProperty(propName, newValue) {
		if (!this.#cssRoot) {
			return this;
		}

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

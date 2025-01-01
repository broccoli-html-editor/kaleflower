import utils79 from 'utils79';

export class Builder {

	#utils;
	#config;
	#components;
	#assets;
	#html;
	#css;
	#js;
	#errors = [];
	#instance_number = 0;

	/**
	 * Constructor
	 */
	constructor($utils, $config, $components, $assets){
		this.#utils = $utils;
		this.#config = $config;
		this.#components = $components;
		this.#assets = $assets;
		this.#html = '';
		this.#css = '';
		this.#js = '';
		this.#errors = [];
		this.#instance_number = 0;
	}

	/**
	 * Get HTML
	 */
	getHtml(){
		return this.#html;
	}

	/**
	 * Get CSS
	 */
	getCss(){
		return this.#css;
	}

	/**
	 * Get JS
	 */
	getJs(){
		return this.#js;
	}

	/**
	 * Get Errors
	 */
	getErrors(){
		return this.#errors;
	}

	/**
	 * Build
	 * @param string $realpath_kflow Realpath of the kflow file.
	 * @param array $options Build options
	 */
	build( $content ){
		try {
			this.#html += this.#buildComponentsRecursive($content);
		} catch(e) {
			console.error(e);
			this.#errors.push(e);
		}
		return;
	}

	/**
	 * Build Components Recursively
	 * @param object $node Node Object
	 * @return string HTML
	 */
	#buildComponentsRecursive($node) {
		let $rtn = '';
		const $currentComponent = this.#components.get_component($node.nodeName || null);

		// 子ノードがあれば、先にそれらを再帰的に走査
		let $innerHTML = '';
		if ($node.hasChildNodes()) {
			$node.childNodes.forEach(($childNode) => {
				$innerHTML += this.#buildComponentsRecursive($childNode);
			});
		}

		let $attributes = {
			'class': '',
			'id': '',
			'style': '',
			'script': '',
		};

		// 属性があれば処理する
		if ($node && $node.hasAttributes && $node.hasAttributes()) {
			Object.keys($node.attributes).forEach((index) => {
				const $attr = $node.attributes[index];
				switch($attr.nodeName){
					case 'width':
						$attributes.style += ' width: '+$attr.nodeValue+';'+"\n";
						break;
					case 'height':
						$attributes.style += ' height: '+$attr.nodeValue+';'+"\n";
						break;
					default:
						$attributes[$attr.nodeName] = $attr.nodeValue;
						break;
				}
			});
		}
		if ($attributes.style.length && !$attributes.class.length) {
			this.#config.id+'-'+(this.#instance_number++);
		}
		if ($attributes.style.length && $attributes.class.length) {
			$attributes.style = '.'+$attributes.class+' {'+"\n"+'  '+$attributes.style+"\n"+'}'+"\n";
		}
		if ($attributes.style.length) {
			this.#css += $attributes.style;
			delete($attributes.style);
		}
		if ($attributes.script.length) {
			this.#js += $attributes.script;
			delete($attributes.script);
		}

		if ($currentComponent && typeof($currentComponent.template) == typeof('string') && $currentComponent.template.length) {
			// コンポーネントにテンプレートが定義されている場合の処理
			this.#utils.bindTwig(
				$currentComponent.template,
				{
					'innerHTML': $innerHTML,
					'attributes': $attributes,
					'assets': this.#assets,
				},
				{
					'json_decode': function($json){
						return JSON.parse($json);
					},
					'json_encode': function($obj){
						return JSON.stringify($obj);
					},
					'urlencode': function($str){
						return encodeURIComponent($str);
					},
				}
			);

		} else {

			// 現在のノードが要素ノードの場合
			if ($node.nodeType == Node.ELEMENT_NODE) {
				// インデントをつけて要素名を表示
				$rtn += "<"+this.#utils.htmlSpecialChars($node.nodeName);

				if($attributes.class.length){
					$rtn += ' class="'+this.#utils.htmlSpecialChars($attributes.class)+'"';
				}

				if($currentComponent && $currentComponent.isVoidElement){
					$rtn += " />";
					return $rtn;
				}

				$rtn += ">";
			}

			// テキストノードがある場合、その内容を表示
			if ($node.nodeType == Node.TEXT_NODE) {
				$rtn += $node.nodeValue;
			}

			// 子ノードがあれば出力する
			$rtn += $innerHTML;

			if ($node.nodeType == Node.ELEMENT_NODE) {
				$rtn += "</"+this.#utils.htmlSpecialChars($node.nodeName)+">";
			}
		}

		return $rtn;
	}
};

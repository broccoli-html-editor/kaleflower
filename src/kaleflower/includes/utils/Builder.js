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
		this.#html += this.#buildComponentsRecursive($content);
		return;
	}

	/**
	 * Build Components Recursively
	 * @param object $node Node Object
	 * @return string HTML
	 */
	#buildComponentsRecursive($node) {
		let $rtn = '';
		this.#components.get_component($node.nodeName ?? null);

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
		if ($node.hasAttributes()) {
			$node.attributes.forEach(($attr) => {
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
		if (strlen($attributes.style ?? '') && !strlen($attributes.class ?? '')) {
			this.#config.id+'-'+(this.#instance_number++);
		}
		if (strlen($attributes.style ?? '') && strlen($attributes.class ?? '')) {
			$attributes.style = '.'+$attributes.class+' {'+"\n"+'  '+$attributes.style+"\n"+'}'+"\n";
		}
		if (strlen($attributes.style ?? '')) {
			this.#css += $attributes.style;
			unset($attributes.style);
		}
		if (strlen($attributes.script ?? '')) {
			this.#js += $attributes.script;
			unset($attributes.script);
		}

		if (strlen($currentComponent.template ?? '')) {
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
						return json_decode($json);
					},
					'json_encode': function($obj){
						return json_encode($obj);
					},
					'urlencode': function($str){
						return urlencode($str);
					},
				}
			);

		} else {

			// 現在のノードが要素ノードの場合
			if ($node.nodeType == XML_ELEMENT_NODE) {
				// インデントをつけて要素名を表示
				$rtn += "<"+htmlspecialchars($node.nodeName);

				if(strlen($attributes.class ?? '')){
					$rtn += ' class="'+htmlspecialchars($attributes.class)+'"';
				}

				if($currentComponent.isVoidElement){
					$rtn += " />";
					return $rtn;
				}

				$rtn += ">";
			}

			// テキストノードがある場合、その内容を表示
			if ($node.nodeType == XML_TEXT_NODE) {
				$rtn += $node.nodeValue;
			}

			// 子ノードがあれば出力する
			$rtn += $innerHTML;

			if ($node.nodeType == XML_ELEMENT_NODE) {
				$rtn += "</".htmlspecialchars($node.nodeName)+">";
			}
		}

		return $rtn;
	}
};

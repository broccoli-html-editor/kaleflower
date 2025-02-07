import utils79 from 'utils79';
import $ from 'jquery';

export class Builder {

	#utils;
	#config;
	#components;
	#fields;
	#assets;
	#html;
	#css;
	#js;
	#errors = [];
	#instance_number = 0;

	/**
	 * Constructor
	 */
	constructor($utils){
		this.#utils = $utils;
		this.#html = '';
		this.#css = '';
		this.#js = '';
		this.#errors = [];
		this.#instance_number = 0;
	}

	/**
	 * Get Errors
	 */
	getErrors(){
		return this.#errors;
	}

	/**
	 * Build
	 * @param {Object} globalState globalState object.
	 * @param {Object} $buildOptions Build options
	 */
	build( globalState, $buildOptions ){
		$buildOptions = $buildOptions || {};
		$buildOptions.assetsPrefix = $buildOptions.assetsPrefix || './';

		const $rtn = {
			'result': true,
			'error': null,
			'html': {
				'main': '',
			},
			'css': '',
			'js': '',
			'assets': [],
		};
		if( !globalState ){
			return {
				'result': false,
				'error': 'kflow file is not exists or not readable.',
				'html': {},
				'css': null,
				'js': null,
				'assets': [],
			};
		}

		this.#config = globalState.configs;
		this.#fields = globalState.fields;
		this.#components = globalState.components;

		Object.keys(globalState.styles).forEach((className) => {
			const $styleNode = globalState.styles[className];
			const $className = $styleNode.getAttribute('class');
			$rtn.css += '.'+$className+' {'+"\n";
			if( $styleNode.getAttribute('width') ){
				$rtn.css += '  width:'+$styleNode.getAttribute('width')+';'+"\n";
			}
			if( $styleNode.getAttribute('height') ){
				$rtn.css += '  height:'+$styleNode.getAttribute('height')+';'+"\n";
			}
			Object.keys($styleNode.childNodes).forEach((idx) => {
				const $child = $styleNode.childNodes[idx];
				// 子ノードを文字列として追加
				$rtn.css += ($styleNode.innerHTML || $child.nodeValue)+"\n";
			});
			$rtn.css += '}'+"\n";
		});

		// アセット (返される用)
		const assets = globalState.assets.getAssets();
		Object.keys(assets).forEach(($assetId) => {
			const $assetNode = assets[$assetId];
			const $isPrivateMaterial = $assetNode.isPrivateMaterial;
			if($isPrivateMaterial){
				return;
			}
			$rtn.assets.push({
				'path': ($buildOptions.assetsPrefix)+$assetNode.publicFilename,
				'base64': $assetNode.base64,
			});
		});

		// アセット (フィールドテンプレートに渡される用)
		this.#assets = globalState.assets.getAssets();
		Object.keys(assets).forEach(($assetId) => {
			const $asset = assets[$assetId];
			this.#assets[$assetId] = {
				'id': $assetId,
				'ext': $asset.ext,
				'size': Number($asset.size),
				'isPrivateMaterial': $asset.isPrivateMaterial,
				'publicFilename': $asset.publicFilename,
				'path': 'data:image/' + $asset.ext+';base64,' + $asset.base64,
				'base64': $asset.base64,
				'field': $asset.field,
				'fieldNote': $asset.fieldNote,
			};
		});

		Object.keys(globalState.contents).forEach(($bowlName) => {
			const $bowlNode = globalState.contents[$bowlName];
			if(!$bowlName.length){
				$bowlName = 'main';
			}
			$bowlNode.childNodes.forEach(($childNode) => {
				this.#html = '';
				this.#css = '';
				this.#js = '';

				try {
					this.#html = this.#buildContentsRecursive($childNode);
				} catch(e) {
					console.error(e);
					this.#errors.push(e);
				}

				$rtn.html[$bowlName] = $rtn.html[$bowlName] || '';
				$rtn.html[$bowlName] += this.#html;
				$rtn.css += this.#css;
				$rtn.js += this.#js;
			});
		});

		return $rtn;
	}

	/**
	 * Build Contents Recursively
	 * @param object $node Node Object
	 * @return string HTML
	 */
	#buildContentsRecursive($node) {
		let $rtn = '';
		const $currentComponent = this.#components.get_component($node.nodeName || null);

		// 子ノードがあれば、先にそれらを再帰的に走査
		let $innerHTML = '';
		if ($node.hasChildNodes()) {
			$node.childNodes.forEach(($childNode) => {
				$innerHTML += this.#buildContentsRecursive($childNode);
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
			const instanceHtml = this.#utils.bindTwig(
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

			const $instanceHtml = $(instanceHtml);
			$instanceHtml.attr({
				'data-kaleflower-instance-id': $node.kaleflowerInstanceId,
			});
			$rtn += $instanceHtml.prop("outerHTML");

		} else {

			// 現在のノードが要素ノードの場合
			if ($node.nodeType == Node.ELEMENT_NODE) {
				// インデントをつけて要素名を表示
				$rtn += "<"+this.#utils.htmlSpecialChars($node.nodeName);

				$rtn += " data-kaleflower-instance-id=\""+($node.kaleflowerInstanceId)+"\"";

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

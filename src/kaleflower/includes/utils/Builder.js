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
	#module_name = '';
	#class_name_prefix = '';
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

		if( this.#config["module-name"] ){
			let $moduleName = this.#config["module-name"].trim();
			$moduleName = $moduleName.replace(/^\-*/, '');
			$moduleName = $moduleName.replace(/\-*$/, '');
			this.#module_name = $moduleName;
		}
		if( this.#config["module-name-prefix"] ){
			let $moduleNamePrefix = this.#config["module-name-prefix"].trim();
			$moduleNamePrefix = $moduleNamePrefix.replace(/^\-*/, '');
			$moduleNamePrefix = $moduleNamePrefix.replace(/\-*$/, '');
			this.#module_name = $moduleNamePrefix + '-' + this.#module_name;
		}
		if( this.#module_name ){
			this.#class_name_prefix = this.#module_name + '__';
		}

		this.#fields = globalState.fields;
		this.#components = globalState.components;

		Object.keys(globalState.styles).forEach((className) => {
			const $styleNode = globalState.styles[className];
			const $className = $styleNode.getAttribute('class');
			$rtn.css += '.'+this.#class_name_prefix+$className+' {'+"\n";
			$rtn.css += this.#buildCssByElementAttr($styleNode);

			Object.keys($styleNode.childNodes).forEach((idx) => {
				const $child = $styleNode.childNodes[idx];
				// 子ノード(カスタムCSS)を文字列として追加
				if ($child.nodeType === Node.TEXT_NODE) {
					$rtn.css += $child.nodeValue+"\n";
				}
			});
			$rtn.css += '}'+"\n";

			// Handle media elements
			Object.values(this.#config['break-points'] || {}).forEach((breakPointConfig) => {
				const breakPointName = breakPointConfig.name;
				const maxWidth = breakPointConfig['max-width'];
				const $mediaNode = Array.from($styleNode.childNodes).find(node => node.nodeName === 'media' && node.getAttribute('break-point') === breakPointName);
				if ($mediaNode) {
					$rtn.css += '@media all and (max-width: ' + maxWidth + 'px) {' + "\n";
					$rtn.css += '.' + this.#class_name_prefix + $className + ' {' + "\n";
					$rtn.css += this.#buildCssByElementAttr($mediaNode);

					Object.keys($mediaNode.childNodes).forEach((idx) => {
						const $grandChild = $mediaNode.childNodes[idx];
						// 子ノード(カスタムCSS)を文字列として追加
						if ($grandChild.nodeType === Node.TEXT_NODE) {
							$rtn.css += $grandChild.nodeValue + "\n";
						}
					});
					$rtn.css += '}' + "\n";
					$rtn.css += '}' + "\n";
				}
			});
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
			$attributes.style += this.#buildCssByElementAttr($node);

			Object.keys($node.attributes).forEach((index) => {
				const $attr = $node.attributes[index];
				switch($attr.nodeName){
					case 'contents-direction':
					case 'scrollable':
					case 'layer':
					case 'layer-position-top':
					case 'layer-position-right':
					case 'layer-position-bottom':
					case 'layer-position-left':
					case 'width':
					case 'height':
						break;
					default:
						$attributes[$attr.nodeName] = $attr.nodeValue;
						break;
				}
			});
		}
		if ($attributes.style.length && !$attributes.class.length) {
			$attributes.class = 'kf-' + this.#config.id+'-'+(this.#instance_number++);
		}
		if ($attributes.style.length && $attributes.class.length) {
			$attributes.style = '.'+this.#class_name_prefix+$attributes.class+' {'+"\n"+''+$attributes.style+"\n"+'}'+"\n";
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
					$rtn += ' class="'+this.#utils.htmlSpecialChars(this.#class_name_prefix+$attributes.class)+'"';
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

	#buildCssByElementAttr($node) {
		let $css = '';
		const attrContentsDirection = $node.getAttribute('contents-direction');
		if( attrContentsDirection == "horizontal" ){
			$css += 'display: flex;'+"\n";
			$css += 'flex-direction: row;'+"\n";
		}

		const attrScrollable = $node.getAttribute('scrollable');
		if( attrScrollable == "auto" ){
			$css += 'overflow: auto;'+"\n";
		}

		const attrLayer = $node.getAttribute('layer');
		const attrLayerPositionTop = $node.getAttribute('layer-position-top');
		const attrLayerPositionRight = $node.getAttribute('layer-position-right');
		const attrLayerPositionBottom = $node.getAttribute('layer-position-bottom');
		const attrLayerPositionLeft = $node.getAttribute('layer-position-left');
		if( attrLayer ){
			if( attrLayer == "relative" ){
				$css += 'position: relative;'+"\n";
			}else if( attrLayer == "absolute" ){
				$css += 'position: absolute;'+"\n";
			}
			$css += (attrLayerPositionTop ? 'top: '+attrLayerPositionTop+';'+"\n" : '');
			$css += (attrLayerPositionRight ? 'right: '+attrLayerPositionRight+';'+"\n" : '');
			$css += (attrLayerPositionBottom ? 'bottom: '+attrLayerPositionBottom+';'+"\n" : '');
			$css += (attrLayerPositionLeft ? 'left: '+attrLayerPositionLeft+';'+"\n" : '');
		}

		const attrWidth = $node.getAttribute('width');
		if( attrWidth ){
			$css += 'width: '+attrWidth+';'+"\n";
		}
		const attrHeight = $node.getAttribute('height');
		if( attrHeight ){
			$css += 'height: '+attrHeight+';'+"\n";
		}
		return $css;
	}
};

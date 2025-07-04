import utils79 from 'utils79';
import $ from 'jquery';

export class Builder {

	#utils;
	#lb;
	#config;
	#buildOptions;
	#components;
	#fields;
	#assets;
	#html;
	#css;
	#js;
	#module_name = '';
	#module_name_prefix = '';
	#class_name_prefix = '';
	#js_script_prefix = '';
	#break_point_query = '@media';
	#errors = [];
	#instance_number = 0;

	/**
	 * Constructor
	 */
	constructor($utils, lb){
		this.#utils = $utils;
		this.#lb = lb;
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
		$buildOptions.extra = $buildOptions.extra || globalState.options.extra || {};
		this.#buildOptions = $buildOptions;

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
			this.#module_name_prefix = $moduleNamePrefix;
		}
		if( this.#module_name && this.#module_name_prefix ){
			this.#class_name_prefix = this.#module_name_prefix + '-' + this.#module_name + '__';
		}else if( this.#module_name ){
			this.#class_name_prefix = this.#module_name + '__';
		}else if( this.#module_name_prefix ){
			this.#class_name_prefix = this.#module_name_prefix + '-';
		}
		this.#js_script_prefix = `const kfGetClassName=(orgName)=>(${JSON.stringify(this.#module_name_prefix)}+orgName);`;

		if( this.#config['break-point-query-type'] && this.#config['break-point-query-type'] == 'container-query' ){
			this.#break_point_query = '@container';
		}
		if( !this.#config['break-points'] ){
			this.#config['break-points'] = {};
		}
		if( !this.#config['color-palettes'] ){
			this.#config['color-palettes'] = {};
		}

		this.#fields = globalState.fields;
		this.#components = globalState.components;

		Object.keys(this.#components.get_custom_components()).forEach((componentName) => {
			$rtn.css += this.#components.get_component(componentName).style;
		});

		Object.keys(globalState.styles).forEach((className) => {
			const $styleNode = globalState.styles[className];
			const $className = $styleNode.getAttribute('class');
			if(!$className){
				Object.keys($styleNode.childNodes).forEach((idx) => {
					const $child = $styleNode.childNodes[idx];
					// 子ノード(カスタムCSS)を文字列として追加
					if ($child.nodeType === Node.TEXT_NODE) {
						$rtn.css += $child.nodeValue+"\n";
					}
				});
				return;
			}

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
			Object.values(this.#config['break-points']).forEach((breakPointConfig) => {
				const breakPointName = breakPointConfig.name;
				const maxWidth = breakPointConfig['max-width'];
				const $mediaNode = Array.from($styleNode.childNodes).find(node => node.nodeName === 'media' && node.getAttribute('break-point') === breakPointName);
				if ($mediaNode) {
					let $tmp_css = '';

					$tmp_css += this.#buildCssByElementAttr($mediaNode);
					Object.keys($mediaNode.childNodes).forEach((idx) => {
						const $grandChild = $mediaNode.childNodes[idx];
						// 子ノード(カスタムCSS)を文字列として追加
						if ($grandChild.nodeType === Node.TEXT_NODE) {
							$tmp_css += $grandChild.nodeValue + "\n";
						}
					});

					if($tmp_css.trim().length){
						$rtn.css += '@media all and (max-width: ' + maxWidth + 'px) {' + "\n";
						$rtn.css += '.' + this.#class_name_prefix + $className + ' {' + "\n";
						$rtn.css += $tmp_css;
						$rtn.css += '}' + "\n";
						$rtn.css += '}' + "\n";
					}
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
				'size': parseInt($asset.size),
				'width': parseInt($asset.width),
				'height': parseInt($asset.height),
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
	 * @param integer $depth Current depth in the DOM tree
	 * @return string HTML
	 */
	#buildContentsRecursive($node, $depth = 0) {
		let $rtn = '';
		const $currentComponent = this.#components.get_component($node.nodeName || null);

		// 子ノードがあれば、先にそれらを再帰的に走査
		let $innerHTML = '';
		if ($node.hasChildNodes()) {
			$node.childNodes.forEach(($childNode) => {
				$innerHTML += this.#buildContentsRecursive($childNode, $depth + 1);
			});
		}

		let $attributes = {
			'class': '',
			'id': '',
			'style': '',
			'breakPoints': {},
			'script': '',
			'onclick': '',
			'onsubmit': '',
		};

		// 属性があれば処理する
		if ($node && $node.hasAttributes && $node.hasAttributes()) {
			$attributes.style += this.#buildCssByElementAttr($node);

			Object.values(this.#config['break-points']).forEach((breakPointConfig) => {
				$attributes.breakPoints[breakPointConfig.name] = $node.getAttribute('style--'+breakPointConfig.name) || '';
				$attributes.breakPoints[breakPointConfig.name] += this.#buildCssByElementAttr($node, breakPointConfig.name);
			});

			Object.keys($node.attributes).forEach((index) => {
				const $attr = $node.attributes[index];
				$attributes[$attr.nodeName] = $attr.nodeValue;
			});
		}

		if (!$depth && $node.nodeType == Node.ELEMENT_NODE && this.#config['break-point-query-type'] && this.#config['break-point-query-type'] == 'container-query') {
			// コンテナクエリの場合、ルート要素に container-type: inline-size; を追加
			if (!$attributes.style.match(/container\-type/ig)) {
				$attributes.style = 'container-type: inline-size;'+$attributes.style;
			}
		}

		const $hasBreakPointCss = Object.keys($attributes.breakPoints).filter((breakPointName) => {
			return $attributes.breakPoints[breakPointName].length;
		});
		const $splitedClassName = $attributes.class.split(/\s/);
		if (!$depth && this.#module_name.length) {
			// ルート要素の場合、モジュール名をクラス名に追加
			if( !$splitedClassName[0].length ){
				$splitedClassName[0] = this.#class_name_prefix.replace(/[-_]*$/, '');
			}
			if (($attributes.style.length || $hasBreakPointCss.length) && !$splitedClassName[0].length) {
				$splitedClassName[0] = 'kf-' + this.#config.id+'-'+(this.#instance_number++);
				if (this.#class_name_prefix.length && $splitedClassName[0].length) {
					$splitedClassName[0] = this.#class_name_prefix + $splitedClassName[0];
				}
			}
		}else{
			if (($attributes.style.length || $hasBreakPointCss.length) && !$splitedClassName[0].length) {
				$splitedClassName[0] = 'kf-' + this.#config.id+'-'+(this.#instance_number++);
			}
			if (this.#class_name_prefix.length && $splitedClassName[0].length) {
				$splitedClassName[0] = this.#class_name_prefix + $splitedClassName[0];
			}
		}
		if ($attributes.style.length && $splitedClassName[0].length) {
			$attributes.style = '.'+$splitedClassName[0]+' {'+"\n"+''+$attributes.style+"\n"+'}'+"\n";
		}
		Object.values(this.#config['break-points']).forEach((breakPointConfig) => {
			const $breakPointStyle = ($attributes.breakPoints[breakPointConfig.name] || '').trim();
			if ($breakPointStyle.length) {
				$attributes.style += this.#break_point_query+' (max-width: '+breakPointConfig['max-width']+'px) {'+"\n";
				$attributes.style += '.'+$splitedClassName[0]+' {'+"\n"+''+$breakPointStyle+"\n"+'}'+"\n";
				$attributes.style += '}'+"\n";
			}
		});
		if ($attributes.style.length) {
			this.#css += $attributes.style;
			delete($attributes.style);
		}
		if ($attributes.script.length) {
			this.#js += $attributes.script;
			delete($attributes.script);
		}

		$attributes.class = $splitedClassName.join(' ');

		if ($currentComponent && typeof($currentComponent.template) == typeof('string') && $currentComponent.template.length) {
			// コンポーネントにテンプレートが定義されている場合の処理
			const instanceHtml = this.#utils.bindTwig(
				$currentComponent.template,
				{
					'innerHTML': $innerHTML,
					'attributes': $attributes,
					'assets': this.#assets,
					'js_script_prefix': this.#js_script_prefix,
					'_ENV': {
						'mode': 'canvas',
						'lang': this.#lb.getLang(),
						'extra': this.#buildOptions.extra,
					},
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

			const $instanceHtml = $(`<div>${instanceHtml}</div>`);
			$instanceHtml.find('>*').attr({
				'data-kaleflower-instance-id': $node.kaleflowerInstanceId,
			});
			$rtn += $instanceHtml.prop("innerHTML");

		} else {

			// 現在のノードが要素ノードの場合
			if ($node.nodeType == Node.ELEMENT_NODE) {
				// インデントをつけて要素名を表示
				$rtn += "<"+this.#utils.htmlSpecialChars($node.nodeName);

				$rtn += " data-kaleflower-instance-id=\""+($node.kaleflowerInstanceId)+"\"";

				if($attributes.class.length){
					$rtn += ' class="'+this.#utils.htmlSpecialChars($attributes.class)+'"';
				}

				if($attributes.onclick.length){
					$rtn += ' onclick="'+this.#utils.htmlSpecialChars(this.#js_script_prefix + $attributes.onclick)+'"';
				}

				if($attributes.onsubmit.length){
					$rtn += ' onsubmit="'+this.#utils.htmlSpecialChars(this.#js_script_prefix + $attributes.onsubmit)+'"';
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

	#buildCssByElementAttr($node, breakPointName) {
		let $css = '';
		const attrNameSufix = (breakPointName ? '--'+breakPointName : '');
		return $css;
	}
};

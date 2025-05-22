<?php
/**
 * Kaleflower
 */
namespace kaleflower;

/**
 * Kaleflower Builder
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class Builder {

	/** Utility */
	private $utils;

	/** Langbank */
	private $lb;

	/** $config */
	private $config;

	/** Build options */
	private $buildOptions;

	/** $components */
	private $components;

	/** $fields */
	private $fields;

	/** $assets */
	private $assets;

	/** HTML */
	private $html;

	/** CSS */
	private $css;

	/** JavaScript */
	private $js;

	/** Module name */
	private $module_name = '';

	/** Module name prefix */
	private $module_name_prefix = '';

	/** Class name prefix */
	private $class_name_prefix = '';

	/** JS Script prefix */
	private $js_script_prefix = '';

	/** Errors */
	private $errors = array();

	/** Instance number */
	private $instance_number = 0;

	/**
	 * Constructor
	 */
	public function __construct($utils, $lb){
		$this->utils = $utils;
		$this->lb = $lb;
		$this->html = '';
		$this->css = '';
		$this->js = '';
		$this->errors = array();
		$this->instance_number = 0;
	}

	/**
	 * Get Errors
	 */
	public function getErrors(){
		return $this->errors;
	}

	/**
	 * Build
	 * @param string $dom Realpath of the kflow file.
	 * @param array $buildOptions Build options
	 */
	public function build( $dom, $buildOptions = array() ){
		$buildOptions = (is_array($buildOptions) || is_object($buildOptions) ? (object) $buildOptions : (object) array());
		$buildOptions->assetsPrefix = $buildOptions->assetsPrefix ?? './';
		$buildOptions->extra = $buildOptions->extra ?? (object) array();
		$this->buildOptions = $buildOptions;

		$rtn = (object) array(
			'result' => true,
			'error' => null,
			'html' => (object) array(
				'main' => null,
			),
			'css' => null,
			'js' => null,
			'assets' => array(),
		);

		$xpath = new \DOMXPath($dom);
		$configNodes = $xpath->query("/kflow/configs/config");
		$styleNodes = $xpath->query("/kflow/styles/style");
		$fieldNodes = $xpath->query("/kflow/fields/field");
		$componentNodes = $xpath->query("/kflow/components/component");
		$assetNodes = $xpath->query("/kflow/assets/asset");
		$contentNodes = $xpath->query("/kflow/contents/content");

		$this->config = (object) array(
			'id' => null,
		);

		foreach ($configNodes as $configNode) {
			$configName = $configNode->getAttribute('name');
			$configValueAttr = $configNode->getAttribute('value');
			$configHasValueAttr = $configNode->hasAttribute('value');

			if ($configHasValueAttr) {
				$this->config->{$configName} = $configValueAttr;
			} else {
				$valueElements = $xpath->query("value", $configNode);
				$this->config->{$configName} = (Object) array();
				foreach ($valueElements as $value) {
					$valueName = $value->getAttribute('name');
					$attrObj = (Object) array();
					foreach ($value->attributes as $attr) {
						$attrObj->{$attr->name} = $attr->value;
					}
					$this->config->{$configName}->{$valueName} = $attrObj;
				}
			}
		}

		if( strlen($this->config->{"module-name"} ?? '') ){
			$moduleName = trim($this->config->{"module-name"});
			$moduleName = preg_replace('/^\-*/', '', $moduleName);
			$moduleName = preg_replace('/\-*$/', '', $moduleName);
			$this->module_name = $moduleName;
		}
		if( strlen($this->config->{"module-name-prefix"} ?? '') ){
			$moduleNamePrefix = trim($this->config->{"module-name-prefix"});
			$moduleNamePrefix = preg_replace('/^\-*/', '', $moduleNamePrefix);
			$moduleNamePrefix = preg_replace('/\-*$/', '', $moduleNamePrefix);
			$this->module_name_prefix = $moduleNamePrefix;
		}
		if( strlen($this->module_name) && strlen($this->module_name_prefix) ){
			$this->class_name_prefix = $this->module_name_prefix.'-'.$this->module_name.'__';
		}elseif( strlen($this->module_name) ){
			$this->class_name_prefix = $this->module_name.'__';
		}elseif( strlen($this->module_name_prefix) ){
			$this->class_name_prefix = $this->module_name_prefix.'-';
		}
		$this->js_script_prefix = 'const kfGetClassName=(orgName)=>('.json_encode($this->class_name_prefix).'+orgName);';

		if( !is_object($this->config->{"break-points"} ?? null) ){
			$this->config->{"break-points"} = (object) array();
		}
		if( !is_object($this->config->{"color-palettes"} ?? null) ){
			$this->config->{"color-palettes"} = (object) array();
		}

		$this->fields = new Fields($this->utils);
		foreach ($fieldNodes as $field) {
			$this->fields->add_field($field);
		}

		$this->components = new Components($this->utils);
		foreach ($componentNodes as $component) {
			$this->components->add_component($component);
		}

		foreach($this->components->get_custom_components() as $component){
			$rtn->css .= $component->style ?? '';
		}

		foreach ($styleNodes as $styleNode) {
			$className = $styleNode->getAttribute('class');
			if(!$className){
				foreach ($styleNode->childNodes as $child) {
					// 子ノード(カスタムCSS)を文字列として追加
					if($child->nodeType === XML_TEXT_NODE) {
						$rtn->css .= $child->nodeValue;
					}
				}
				continue;
			}
			$rtn->css .= '.'.$this->class_name_prefix.$className.' {'."\n";
			$rtn->css .= $this->buildCssByElementAttr($styleNode);

			foreach ($styleNode->childNodes as $child) {
				// 子ノード(カスタムCSS)を文字列として追加
				if($child->nodeType === XML_TEXT_NODE) {
					$rtn->css .= $child->nodeValue;
				}
			}
			$rtn->css .= '}'."\n";

			// Handle media elements
			// Handle media elements for each break point
			foreach ($this->config->{'break-points'} as $breakPointName => $breakPointNode) {
				$maxWidth = $breakPointNode->{'max-width'};
				$mediaNodes = $xpath->query("media[@break-point='" . $breakPointName . "']", $styleNode);
				
				if ($mediaNodes->length > 0) {
					$tmp_css = '';
					foreach ($mediaNodes as $mediaNode) {
						$tmp_css .= $this->buildCssByElementAttr($mediaNode);
						foreach ($mediaNode->childNodes as $child) {
							if($child->nodeType === XML_TEXT_NODE) {
								$tmp_css .= $child->nodeValue;
							}
						}
					}

					if(strlen(trim($tmp_css))){
						$rtn->css .= '@media all and (max-width: '.$maxWidth.'px) {'."\n";
						$rtn->css .= '.'.$this->class_name_prefix.$className.' {'."\n";
						$rtn->css .= $tmp_css;
						$rtn->css .= '}'."\n";
						$rtn->css .= '}'."\n";
					}
					unset($tmp_css);
				}
			}
		}

		// アセット (返される用)
		foreach ($assetNodes as $assetNode) {
			$isPrivateMaterial = $assetNode->getAttribute('is-private-material');
			if($this->utils->to_boolean($isPrivateMaterial)){
				continue;
			}
			array_push($rtn->assets, (object) array(
				'path' => $buildOptions->assetsPrefix.$assetNode->getAttribute('public-filename'),
				'base64' => $assetNode->getAttribute('base64'),
			));
		}

		// アセット (フィールドテンプレートに渡される用)
		$this->assets = array();
		foreach ($assetNodes as $assetNode) {
			$assetId = $assetNode->getAttribute('id');
			$this->assets[$assetId] = array(
				'id' => $assetId,
				'ext' => $assetNode->getAttribute('ext'),
				'size' => intval($assetNode->getAttribute('size')),
				'width' => intval($assetNode->getAttribute('width')),
				'height' => intval($assetNode->getAttribute('height')),
				'isPrivateMaterial' => $this->utils->to_boolean($assetNode->getAttribute('is-private-material')),
				'publicFilename' => $this->utils->to_boolean($assetNode->getAttribute('public-filename')),
				'path' => $buildOptions->assetsPrefix.$assetNode->getAttribute('public-filename'),
				'base64' => $assetNode->getAttribute('base64'),
				'field' => $assetNode->getAttribute('field'),
				'fieldNote' => $assetNode->getAttribute('field-note'),
			);
		}

		foreach ($contentNodes as $contentNode) {
			$bowlName = $contentNode->getAttribute('name');
			if(!strlen($bowlName ?? '')){
				$bowlName = 'main';
			}
			foreach($contentNode->childNodes as $childNode){
				$this->buildContent($childNode);

				$rtn->html->{$bowlName} = $rtn->html->{$bowlName} ?? '';
				$rtn->html->{$bowlName} .= $this->html;
				$rtn->css .= $this->css;
				$rtn->js .= $this->js;
			}
		}

		return $rtn;
	}

	/**
	 * Build Content
	 * @param object $content Content object.
	 */
	private function buildContent( $content ){
		$this->html = '';
		$this->css = '';
		$this->js = '';

		$this->html = $this->buildComponentsRecursive($content);
		return;
	}

	/**
	 * Build Components Recursively
	 * @param object $node Node Object
	 * @return string HTML
	 */
	private function buildComponentsRecursive($node) {
		$rtn = '';
		$currentComponent = $this->components->get_component($node->nodeName ?? null);

		// 子ノードがあれば、先にそれらを再帰的に走査
		$innerHTML = '';
		if ($node->hasChildNodes()) {
			foreach ($node->childNodes as $childNode) {
				$innerHTML .= $this->buildComponentsRecursive($childNode);
			}
		}

		$attributes = (object) array(
			'class' => '',
			'id' => '',
			'style' => '',
			'breakPoints' => (object) array(),
			'script' => '',
			'onclick' => '',
			'onsubmit' => '',
		);

		// 属性があれば処理する
		if ($node->hasAttributes()) {
			$attributes->style .= $this->buildCssByElementAttr($node);

			foreach ($this->config->{'break-points'} as $breakPointName => $breakPointNode) {
				$attributes->breakPoints->{$breakPointName} = $node->getAttribute('style--'.$breakPointName) ?? '';
				$attributes->breakPoints->{$breakPointName} .= $this->buildCssByElementAttr($node, $breakPointName);
			}

			foreach ($node->attributes as $attr) {
				$attributes->{$attr->nodeName} = $attr->nodeValue;
			}
		}

		$hasBreakPointCss = array();
		foreach($attributes->breakPoints as $breakPointName => $breakPointStyle){
			if( strlen($breakPointStyle) ){
				array_push($hasBreakPointCss, $breakPointName);
			}
		}
		$splitedClassName = preg_split('/\s/', $attributes->class ?? '');
		if ((strlen($attributes->style ?? '') || count($hasBreakPointCss)) && !strlen($splitedClassName[0] ?? '')) {
			$splitedClassName[0] = 'kf-'.urlencode($this->config->id).'-'.($this->instance_number++);
		}
		if( strlen($this->class_name_prefix ?? '') && strlen($splitedClassName[0] ?? '') ){
			$splitedClassName[0] = $this->class_name_prefix.$splitedClassName[0];
		}
		if (strlen($attributes->style ?? '') && strlen($splitedClassName[0] ?? '')) {
			$attributes->style = '.'.$splitedClassName[0].' {'."\n".''.$attributes->style."\n".'}'."\n";
		}
		foreach ($this->config->{'break-points'} as $breakPointName => $breakPointNode) {
			$breakPointStyle = trim($attributes->breakPoints->{$breakPointName} ?? '');
			if (strlen($breakPointStyle)) {
				$attributes->style .= '@media all and (max-width: '.$breakPointNode->{'max-width'}.'px) {'."\n";
				$attributes->style .= '.'.$splitedClassName[0].' {'."\n".''.$breakPointStyle."\n".'}'."\n";
				$attributes->style .= '}'."\n";
			}
		}
		if (strlen($attributes->style ?? '')) {
			$this->css .= $attributes->style;
			unset($attributes->style);
		}
		if (strlen($attributes->script ?? '')) {
			$this->js .= $attributes->script;
			unset($attributes->script);
		}

		$attributes->class = implode(' ', array_filter($splitedClassName));

		if (strlen($currentComponent->template ?? '')) {
			// コンポーネントにテンプレートが定義されている場合の処理
			$instanceHtml = $this->utils->bindTwig(
				$currentComponent->template,
				array(
					'innerHTML' => $innerHTML,
					'attributes' => $attributes,
					'assets' => $this->assets,
					'js_script_prefix' => $this->js_script_prefix,
					'_ENV' => array(
						'mode' => 'finalize',
						'lang' => $this->lb->getLang(),
						'extra' => $this->buildOptions->extra,
					),
				),
				array(
					'json_decode' => function($json){
						return json_decode($json);
					},
					'json_encode' => function($obj){
						return json_encode($obj);
					},
					'urlencode' => function($str){
						return urlencode($str);
					},
				)
			);
			$rtn .= $instanceHtml;

		} else {

			// 現在のノードが要素ノードの場合
			if ($node->nodeType == XML_ELEMENT_NODE) {
				// インデントをつけて要素名を表示
				$rtn .= "<".htmlspecialchars($node->nodeName);

				if(strlen($attributes->class ?? '')){
					$rtn .= ' class="'.htmlspecialchars($attributes->class).'"';
				}

				if(strlen($attributes->onclick ?? '')){
					$rtn .= ' onclick="'.htmlspecialchars($this->js_script_prefix.$attributes->onclick).'"';
				}

				if(strlen($attributes->onsubmit ?? '')){
					$rtn .= ' onsubmit="'.htmlspecialchars($this->js_script_prefix.$attributes->onsubmit).'"';
				}

				if($currentComponent->isVoidElement){
					$rtn .= " />";
					return $rtn;
				}

				$rtn .= ">";
			}

			// テキストノードがある場合、その内容を表示
			if ($node->nodeType == XML_TEXT_NODE) {
				$rtn .= $node->nodeValue;
			}

			// 子ノードがあれば出力する
			$rtn .= $innerHTML;

			if ($node->nodeType == XML_ELEMENT_NODE) {
				$rtn .= "</".htmlspecialchars($node->nodeName).">";
			}
		}

		return $rtn;
	}

	private function buildCssByElementAttr($node, $breakPointName = null) {
		$css = '';
		$attrNameSufix = ($breakPointName ? '--'.$breakPointName : '');
		return $css;
	}
}

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

	/** $config */
	private $config;

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

	/** Errors */
	private $errors = array();

	/**
	 * Constructor
	 */
	public function __construct($utils){
		$this->utils = $utils;
		$this->html = '';
		$this->css = '';
		$this->js = '';
		$this->errors = array();
	}

	/**
	 * Get Errors
	 */
	public function getErrors(){
		return $this->errors;
	}

	/**
	 * Build
	 * @param string $realpath_kflow Realpath of the kflow file.
	 * @param array $buildOptions Build options
	 */
	public function build( $realpath_kflow, $buildOptions = array() ){
		$buildOptions = (is_array($buildOptions) || is_object($buildOptions) ? (object) $buildOptions : (object) array());
		$buildOptions->assetsPrefix = $buildOptions->assetsPrefix ?? './';

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
		if( !is_file($realpath_kflow) || !is_readable($realpath_kflow) ){
			return (object) array(
				'result' => false,
				'error' => 'kflow file is not exists or not readable.',
				'html' => (object) array(),
				'css' => null,
				'js' => null,
				'assets' => array(),
			);
		}

		// DOMDocumentのインスタンス作成
		$dom = new \DOMDocument();
		$dom->load($realpath_kflow);

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
			$this->config->{$configName} = $configNode->getAttribute('value');
		}

		$this->fields = new Fields($this->utils);
		foreach ($fieldNodes as $field) {
			$this->fields->add_field($field);
		}

		$this->components = new Components($this->utils);
		foreach ($componentNodes as $component) {
			$this->components->add_component($component);
		}

		foreach ($styleNodes as $styleNode) {
			$className = $styleNode->getAttribute('class');
			$rtn->css .= '.'.$className.' {'."\n";
			if( $styleNode->getAttribute('width') ){
				$rtn->css .= '  width:'.$styleNode->getAttribute('width').';'."\n";
			}
			if( $styleNode->getAttribute('height') ){
				$rtn->css .= '  height:'.$styleNode->getAttribute('height').';'."\n";
			}
			foreach ($styleNode->childNodes as $child) {
				// 子ノードを文字列として追加
				$rtn->css .= $styleNode->ownerDocument->saveHTML($child)."\n";
			}
			$rtn->css .= '}'."\n";
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
		static $instance_number = 0;
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
			'script' => '',
		);

		// 属性があれば処理する
		if ($node->hasAttributes()) {
			foreach ($node->attributes as $attr) {
				switch($attr->nodeName){
					case 'width':
						$attributes->style .= ' width: '.$attr->nodeValue.';'."\n";
						break;
					case 'height':
						$attributes->style .= ' height: '.$attr->nodeValue.';'."\n";
						break;
					default:
						$attributes->{$attr->nodeName} = $attr->nodeValue;
						break;
				}
			}
		}
		if (strlen($attributes->style ?? '') && !strlen($attributes->class ?? '')) {
			$attributes->class = 'kf-'.urlencode($this->config->id).'-'.($instance_number++);
		}
		if (strlen($attributes->style ?? '') && strlen($attributes->class ?? '')) {
			$attributes->style = '.'.$attributes->class.' {'."\n".'  '.$attributes->style."\n".'}'."\n";
		}
		if (strlen($attributes->style ?? '')) {
			$this->css .= $attributes->style;
			unset($attributes->style);
		}
		if (strlen($attributes->script ?? '')) {
			$this->js .= $attributes->script;
			unset($attributes->script);
		}

		if (strlen($currentComponent->template ?? '')) {
			// コンポーネントにテンプレートが定義されている場合の処理
			$rtn .= $this->utils->bindTwig(
				$currentComponent->template,
				array(
					'innerHTML' => $innerHTML,
					'attributes' => $attributes,
					'assets' => $this->assets,
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

		} else {

			// 現在のノードが要素ノードの場合
			if ($node->nodeType == XML_ELEMENT_NODE) {
				// インデントをつけて要素名を表示
				$rtn .= "<".htmlspecialchars($node->nodeName);

				if(strlen($attributes->class ?? '')){
					$rtn .= ' class="'.htmlspecialchars($attributes->class).'"';
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
}

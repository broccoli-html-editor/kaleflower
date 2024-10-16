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

	/** $components */
	private $components;

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
	public function __construct($utils, $components){
		$this->utils = $utils;
		$this->components = $components;
		$this->html = '';
		$this->css = '';
		$this->js = '';
		$this->errors = array();
	}

	/**
	 * Get HTML
	 */
	public function getHtml(){
		return $this->html;
	}

	/**
	 * Get CSS
	 */
	public function getCss(){
		return $this->css;
	}

	/**
	 * Get JS
	 */
	public function getJs(){
		return $this->js;
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
	 * @param array $options Build options
	 */
	public function build( $content ){
		$this->html .= $this->build_components_recursive($content);
		return;
	}

	/**
	 * Build Components Recursively
	 * @param object $node Node Object
	 * @return string HTML
	 */
	private function build_components_recursive($node) {
		static $instance_number = 0;
		$rtn = '';
		$currentComponent = $this->components->get_component($node->nodeName ?? null);

		// 子ノードがあれば、先にそれらを再帰的に走査
		$innerHTML = '';
		if ($node->hasChildNodes()) {
			foreach ($node->childNodes as $childNode) {
				$innerHTML .= $this->build_components_recursive($childNode);
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
		if(strlen($attributes->style ?? '') && !strlen($attributes->class ?? '')) {
			$attributes->class = 'kf'.($instance_number++);
		}
		if(strlen($attributes->style ?? '') && strlen($attributes->class ?? '')) {
			$attributes->style = '.'.$attributes->class.' {'."\n".'  '.$attributes->style."\n".'}'."\n";
		}
		if(strlen($attributes->style ?? '')) {
			$this->css .= $attributes->style;
		}
		if(strlen($attributes->script ?? '')) {
			$this->js .= $attributes->script;
		}

		if( strlen($currentComponent->template ?? '') ){
			// 子ノードがあれば出力する
			$rtn .= $currentComponent->template;

		}else{

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

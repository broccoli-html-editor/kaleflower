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
		$rtn = '';

		// 現在のノードが要素ノードの場合
		if ($node->nodeType == XML_ELEMENT_NODE) {
			// インデントをつけて要素名を表示
			$rtn .= "<".htmlspecialchars($node->nodeName);

			// 属性があれば表示
			if ($node->hasAttributes()) {
				foreach ($node->attributes as $attr) {
					$rtn .= " ".htmlspecialchars($attr->nodeName).'="'.htmlspecialchars($attr->nodeValue).'"';
				}
			}

			$rtn .= ">";
		}

		// テキストノードがある場合、その内容を表示
		if ($node->nodeType == XML_TEXT_NODE) {
			$rtn .= $node->nodeValue;
		}

		// 子ノードがあれば、それらを再帰的に走査
		if ($node->hasChildNodes()) {
			foreach ($node->childNodes as $childNode) {
				$rtn .= $this->build_components_recursive($childNode);
			}
		}

		if ($node->nodeType == XML_ELEMENT_NODE) {
			$rtn .= "</".htmlspecialchars($node->nodeName).">";
		}

		return $rtn;
	}
}

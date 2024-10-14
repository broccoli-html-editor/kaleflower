<?php
/**
 * Kaleflower
 */
namespace kaleflower;

/**
 * Kaleflower core class
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class kaleflower {

	/** Utility */
	private $utils;

	/** Options */
	private $options;

	/**
	 * Constructor
	 */
	public function __construct($options = array()){
		$this->options = (is_array($options) || is_object($options) ? (object) $options : (object) array());
		$this->utils = new Utils();
	}

	/**
	 * Build
	 * @param string $realpath_kflow Realpath of the kflow file.
	 * @param array $options Build options
	 */
	public function build( $realpath_kflow, $options = array() ){
		$options = (is_array($options) || is_object($options) ? (object) $options : (object) array());

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
		$components = $xpath->query("/kflow/components/component");
		$assets = $xpath->query("/kflow/assets/asset");
		$contents = $xpath->query("/kflow/contents/content");

		foreach ($components as $component) {
			// TODO:
		}

		foreach ($assets as $asset) {
			// TODO:
		}

		foreach ($contents as $content) {
			$innerText = '';
			$bowlName = $content->getAttribute('name');
			if(!strlen($bowlName ?? '')){
				$bowlName = 'main';
			}
			foreach($content->childNodes as $childNode){
				$builder = new Builder($this->utils);
				$builder->build($childNode);

				$rtn->html->{$bowlName} = $rtn->html->{$bowlName} ?? '';
				$rtn->html->{$bowlName} .= $builder->getHtml();
				$rtn->css .= $builder->getCss();
				$rtn->js .= $builder->getJs();
			}
		}

		return $rtn;
	}

}

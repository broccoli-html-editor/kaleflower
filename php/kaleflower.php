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
		$configNodes = $xpath->query("/kflow/configs/config");
		$styleNodes = $xpath->query("/kflow/styles/style");
		$fieldNodes = $xpath->query("/kflow/fields/field");
		$componentNodes = $xpath->query("/kflow/components/component");
		$assetNodes = $xpath->query("/kflow/assets/asset");
		$contentNodes = $xpath->query("/kflow/contents/content");

		$config = (object) array(
			'id' => null,
		);
		foreach ($configNodes as $configNode) {
			$innerText = '';
			$configName = $configNode->getAttribute('name');
			$config->{$configName} = $configNode->getAttribute('value');
		}

		$fields = new Fields($this->utils);
		foreach ($fieldNodes as $field) {
			$fields->add_field($field);
		}

		$components = new Components($this->utils);
		foreach ($componentNodes as $component) {
			$components->add_component($component);
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
				'path' => './'.$assetNode->getAttribute('public-filename'),
				'base64' => $assetNode->getAttribute('base64'),
			));
		}

		// アセット (フィールドテンプレートに渡される用)
		$allAssets = array();
		foreach ($assetNodes as $assetNode) {
			$assetId = $assetNode->getAttribute('id');
			$allAssets[$assetId] = array(
				'id' => $assetId,
				'ext' => $assetNode->getAttribute('ext'),
				'size' => intval($assetNode->getAttribute('size')),
				'isPrivateMaterial' => $this->utils->to_boolean($assetNode->getAttribute('is-private-material')),
				'path' => './'.$assetNode->getAttribute('public-filename'),
				'base64' => $assetNode->getAttribute('base64'),
				'field' => $assetNode->getAttribute('field'),
				'fieldNote' => $assetNode->getAttribute('field-note'),
			);
		}

		foreach ($contentNodes as $contentNode) {
			$innerText = '';
			$bowlName = $contentNode->getAttribute('name');
			if(!strlen($bowlName ?? '')){
				$bowlName = 'main';
			}
			foreach($contentNode->childNodes as $childNode){
				$builder = new Builder($this->utils, $config, $components, $allAssets);
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

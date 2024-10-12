<?php
/**
 * kaleflower
 */
namespace kaleflower;

/**
 * kaleflower core class
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class kaleflower{

	/** FileSystem Utility */
	private $fs;

	/** LangBank object */
	private $lb;

	/** Options */
	private $options;

	/**
	 * Constructor
	 */
	public function __construct($options = array()){
		$this->options = (is_array($options) || is_object($options) ? (object) $options : (object) array());

		$this->fs = new \tomk79\filesystem();
		$this->lb = new \tomk79\LangBank(__DIR__.'/../data/language.csv');
	}

	/**
	 * $fs
	 * @return object FileSystem Utility Object.
	 */
	public function fs(){
		return $this->fs;
	}

	/**
	 * $lb
	 * @return object LangBank Object.
	 */
	public function lb(){
		return $this->lb;
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
		);
		if( !is_file($realpath_kflow) || !is_readable($realpath_kflow) ){
			return (object) array(
				'result' => false,
				'error' => 'kflow file is not exists or not readable.',
				'html' => (object) array(),
				'css' => null,
				'js' => null,
			);
		}

		// DOMDocumentのインスタンス作成
		$dom = new \DOMDocument();
		$dom->load($realpath_kflow);

		$kflows = $dom->getElementsByTagName('kflow');
		foreach ($kflows as $kflow) {
			$documents = $kflow->getElementsByTagName('document');
			foreach ($documents as $document) {
				$innerText = '';
				$bowlName = $document->getAttribute('name');
				if(!strlen($bowlName ?? '')){
					$bowlName = 'main';
				}
				foreach($document->childNodes as $childNode){
					$rtn->html->{$bowlName} = $rtn->html->{$bowlName} ?? '';
					$rtn->html->{$bowlName} .= $document->ownerDocument->saveHTML($childNode);
				}
			}
		}

		return $rtn;
	}

}

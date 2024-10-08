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

	/**
	 * Constructor
	 */
	public function __construct(){
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
	 * Initialize
	 * @param array $options オプション
	 */
	public function init( $options = array() ){
		$options = (is_array($options) ? $options : array());
	}

}

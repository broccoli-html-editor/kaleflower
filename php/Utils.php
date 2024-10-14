<?php
/**
 * Kaleflower
 */
namespace kaleflower;

/**
 * Kaleflower Utility
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class Utils {

	/** FileSystem Utility */
	private $fs;

	/** LangBank object */
	private $lb;

	/**
	 * Constructor
	 */
	public function __construct($options = array()){
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
}

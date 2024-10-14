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

	/**
	 * 文字列を真偽値に変換する
	 * @param string $val 変換する文字列
	 * @return boolean 変換された真偽値
	 */
	public function to_boolean($val){
		if(is_string($val)){
			$val = strtolower($val);
		}

		switch($val){
			case 'false':
			case '0':
			case 'no':
			case 'off':
				return false;
				break;
			case 'true':
			case '1':
			case 'yes':
			case 'on':
				return true;
				break;
			default:
				break;
		}
		return !!$val;
	}
}

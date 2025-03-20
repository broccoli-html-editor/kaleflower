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
	 * @param array $buildOptions Build options
	 */
	public function build( $realpath_kflow, $buildOptions = array() ){
		$builder = new Builder($this->utils, $this->utils->lb());
		$rtn = $builder->build($realpath_kflow, $buildOptions);
		return $rtn;
	}

}

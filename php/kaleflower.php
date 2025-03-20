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

	/** Kaleflower XML */
	private $kflowXml;

	/**
	 * Constructor
	 */
	public function __construct(){
		$this->utils = new Utils();
		$this->kflowXml = new kflowXml();
	}

	/**
	 * Load kflow XML from file
	 * @param string $realpath_kflow Realpath of the kflow file.
	 */
	public function load( $realpath_kflow ){
		return $this->kflowXml->load($realpath_kflow);
	}

	/**
	 * Load kflow XML from sourcecode
	 * @param string $src_xml Sourcecode of the kflow XML Document.
	 */
	public function loadXml( $src_xml ){
		return $this->kflowXml->loadXml($src_xml);
	}

	/**
	 * Get kflow XML sourcecode
	 */
	public function getXml(){
		return $this->kflowXml->getXml();
	}

	/**
	 * Build
	 * @param array $buildOptions Build options
	 */
	public function build( $buildOptions = array() ){

		// Check if two arguments are provided
		if (func_num_args() == 2) {
			$realpath_kflow = func_get_arg(0);
			$buildOptions = func_get_arg(1);
			
			// Load the XML file
			$this->load($realpath_kflow);
		}

		$builder = new Builder($this->utils, $this->utils->lb());
		$rtn = $builder->build($this->kflowXml->getDom(), $buildOptions);
		return $rtn;
	}

}

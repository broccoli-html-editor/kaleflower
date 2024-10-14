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
		$this->html .= $content->ownerDocument->saveHTML($content);
	}
}

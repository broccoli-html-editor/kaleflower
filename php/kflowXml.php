<?php
/**
 * Kaleflower XML Parser
 */
namespace kaleflower;

/**
 * Kaleflower XML Parser
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class kflowXml {

	/** Utility */
	private $utils;

	/** kflow XML object */
	private $dom;

	/**
	 * Constructor
	 */
	public function __construct(){
	}

	/**
	 * Get DOMDocument object
	 */
	public function getDom(){
		return $this->dom;
	}

	/**
	 * Get XML sourcecode
	 */
	public function getXml(){
		if( !$this->dom ){
			return false;
		}
		return $this->dom->saveXML();
	}

	/**
	 * Load kflow XML from file
	 * @param string $realpath_kflow Realpath of the kflow file.
	 */
	public function load( $realpath_kflow ){
		if( !is_file($realpath_kflow) || !is_readable($realpath_kflow) ){
			return false;
		}

		$dom = new \DOMDocument();
		$dom->load($realpath_kflow);

		$this->mergeDom($dom);

		return true;
	}

	/**
	 * Load kflow XML from sourcecode
	 * @param string $src_xml Sourcecode of the kflow XML Document.
	 */
	public function loadXml( $src_xml ){
		$dom = new \DOMDocument();
		$dom->loadXml($src_xml);

		$this->mergeDom($dom);

		return true;
	}

	/**
	 * Merge DOM
	 * @param object $dom DOMDocument object
	 * @return boolean Result
	 */
	private function mergeDom($dom){
		if( !$this->dom ){
			$this->dom = $dom;
			return true;
		}

		// TODO: すでに $this->dom に DOM が読み込まれている場合、
		// 新しい $dom の内容の差分のみをマージする処理を実装する。
		// ただし、この処理は、
		// 1. $domから、マージの対象となる要素を抽出する
		// 2. その要素を $this->dom に追加する
		// という処理を行う。

		return true;
	}
}

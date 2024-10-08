<?php
/**
 * test for broccoli-html-editor/broccoli-html-editor
 */
class mainTest extends PHPUnit\Framework\TestCase{
	private $fs;

	public function setup() : void{
		mb_internal_encoding('UTF-8');
		require_once(__DIR__.'/php_test_helper/helper.php');
		testHelper::start_built_in_server();
		$this->fs = new \tomk79\filesystem();
	}


	/**
	 * インスタンス初期化
	 */
	public function testInitialize(){
		$kaleflower = new \kaleflower\kaleflower();
		$this->assertTrue( is_object($kaleflower) );
	}

}

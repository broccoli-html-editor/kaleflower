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
	 * ビルド
	 */
	public function testBuild(){
		$kaleflower = new \kaleflower\kaleflower();
		$this->assertTrue( is_object($kaleflower) );

		$result = $kaleflower->build(
			__DIR__.'/testdata/kflows/general.kflow',
		);
		// var_dump($result);
		$this->assertTrue( is_object($result) );
		$this->assertTrue( $result->result );
	}

}

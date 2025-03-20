<?php
/**
 * test for Kaleflower
 */
class kflowXmlTest extends PHPUnit\Framework\TestCase{
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

		$kaleflower->load(__DIR__.'/testdata/kflows/merge_test/merge1-base.kflow');
		$kaleflower->load(__DIR__.'/testdata/kflows/merge_test/merge2-additional.kflow');
		$kaleflower->load(__DIR__.'/testdata/kflows/merge_test/merge3-override.kflow');
		$result = $kaleflower->build(
			array(
				'assetsPrefix' => './main_files/',
			)
		);

		$this->assertTrue( is_object($result) );
		$this->assertTrue( $result->result );

		$xml = $kaleflower->getXml();
		$this->assertTrue( is_string($xml) );
		$this->assertTrue( strlen($xml) > 0 );
	}

}

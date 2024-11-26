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

		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/main.html', $result->html->main);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/sidebar.html', $result->html->sidebar);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/styles.css', $result->css);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/scripts.js', $result->js);

		$this->fs->mkdir(__DIR__.'/testdata/kflows/dist/general/assets/');
		foreach($result->assets as $asset){
			$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/assets/'.$asset->path, base64_decode($asset->base64));
		}
	}

}

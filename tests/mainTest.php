<?php
/**
 * test for Kaleflower
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

		// general.kflow
		$result = $kaleflower->build(
			__DIR__.'/testdata/kflows/general.kflow',
			array(
				'assetsPrefix' => './main_files/',
				"extra" => array(
					"sample" => "sample value",
				),
			)
		);

		$result->html->main = preg_replace('/\{\{sample\}\}/s', 'sample value (finalized)', $result->html->main);

		$this->assertTrue( is_object($result) );
		$this->assertTrue( $result->result );

		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/main.html', $result->html->main);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/sidebar.html', $result->html->sidebar);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/styles.css', $result->css);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/scripts.js', $result->js);

		$this->fs->mkdir(__DIR__.'/testdata/kflows/dist/general/main_files/');
		foreach($result->assets as $asset){
			$this->fs->save_file(__DIR__.'/testdata/kflows/dist/general/'.$asset->path, base64_decode($asset->base64));
		}
	}

	/**
	 * ビルド empty.kflow
	 */
	public function testBuildEmptyContents(){
		$kaleflower = new \kaleflower\kaleflower();
		$this->assertTrue( is_object($kaleflower) );

		// empty.kflow
		$result = $kaleflower->build(
			__DIR__.'/testdata/kflows/empty.kflow',
			array(
				'assetsPrefix' => './main_files/',
				"extra" => array(
					"sample" => "sample value",
				),
			)
		);

		$this->assertTrue( is_object($result) );
		$this->assertFalse( $result->result );

		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/empty/main.html', $result->html->main);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/empty/styles.css', $result->css);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/empty/scripts.js', $result->js);

		$this->fs->mkdir(__DIR__.'/testdata/kflows/dist/empty/main_files/');
		foreach($result->assets as $asset){
			$this->fs->save_file(__DIR__.'/testdata/kflows/dist/empty/'.$asset->path, base64_decode($asset->base64));
		}

		// empty-002.kflow
		$result = $kaleflower->build(
			__DIR__.'/testdata/kflows/empty-002.kflow',
			array(
				'assetsPrefix' => './main_files/',
				"extra" => array(
					"sample" => "sample value",
				),
			)
		);

		$this->assertTrue( is_object($result) );
		$this->assertTrue( $result->result );

		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/empty-002/main.html', $result->html->main);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/empty-002/styles.css', $result->css);
		$this->fs->save_file(__DIR__.'/testdata/kflows/dist/empty-002/scripts.js', $result->js);

		$this->fs->mkdir(__DIR__.'/testdata/kflows/dist/empty-002/main_files/');
		foreach($result->assets as $asset){
			$this->fs->save_file(__DIR__.'/testdata/kflows/dist/empty-002/'.$asset->path, base64_decode($asset->base64));
		}
	}

}

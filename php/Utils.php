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

	/**
	 * build Twig
	 * @param string $template テンプレート
	 * @param array $data 入力データ
	 * @param array $funcs カスタム関数
	 * @return string バインド済み文字列
	 */
	public function bindTwig($template, $data = array(), $funcs = array()){
		$rtn = $template;
		if( is_object($data) ){
			$data = (array) $data;
		}

		if( class_exists('\\Twig_Loader_Array') ){
			// Twig ^1.35, ^2.12
			$loader = new \Twig_Loader_Array(array(
				'index' => $template,
			));
			$twig = new \Twig_Environment($loader, array('debug' => true, 'autoescape' => 'html'));
			$twig->addExtension(new \Twig_Extension_Debug());
			foreach( $funcs as $fncName=>$callback ){
				$function = new \Twig_SimpleFunction($fncName, $callback);
				$twig->addFunction($function);
			}
			$rtn = $twig->render('index', $data);

		}elseif( class_exists('\\Twig\\Loader\\ArrayLoader') ){
			// Twig ^3.0.0
			$loader = new \Twig\Loader\ArrayLoader([
				'index' => $template,
			]);
			$twig = new \Twig\Environment($loader, array('debug' => true, 'autoescape' => 'html'));
			$twig->addExtension(new \Twig\Extension\DebugExtension());
			foreach( $funcs as $fncName=>$callback ){
				$function = new \Twig\TwigFunction($fncName, $callback);
				$twig->addFunction($function);
			}
			$rtn = $twig->render('index', $data);

		}

		return $rtn;
	}
}

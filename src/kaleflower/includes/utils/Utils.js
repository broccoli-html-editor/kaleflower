import utils79 from 'utils79';
import Twig from 'twig';

export class Utils {

	/**
	 * 文字列を真偽値に変換する
	 * @param string $val 変換する文字列
	 * @return boolean 変換された真偽値
	 */
	toBoolean($val){
		if(typeof($val) == typeof('string')){
			$val = $val.toLowerCase();
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

	md5(bin){
		return utils79.md5(bin);
	}

	base64Encode(bin){
		return utils79.base64_encode(bin);
	}

	base64Decode(base64){
		return utils79.base64_decode(base64);
	}

	createUUID(){
		return "kf"+((new Date).getTime().toString(16)+Math.floor(1E7*Math.random()).toString(16));
	}

	appendChild(targetElement, newChildElementTagName){
		const newChild = document.createElementNS('', newChildElementTagName);
		newChild.kaleflowerNodeId = this.createUUID();
		targetElement.appendChild(newChild);
		return newChild;
	}

	htmlSpecialChars(str){
		return utils79.h(str);
	}

	/**
	 * Twig テンプレートにデータをバインドする
	 */
	bindTwig(tpl, data, funcs){
		let rtn = '';
		let twig;
		try {
			twig = Twig.twig;

			Object.keys(funcs).forEach( ($fncName, index) => {
				const $callback = funcs[$fncName];
				Twig.extendFunction($fncName, $callback);
			});

			rtn = new twig({
				'data': tpl,
				'autoescape': true,
			}).render(data);
		} catch(e) {
			const errorMessage = 'TemplateEngine "Twig" Rendering ERROR.';
			console.error( errorMessage );
			rtn = errorMessage;
		}
		return rtn;
	}
};

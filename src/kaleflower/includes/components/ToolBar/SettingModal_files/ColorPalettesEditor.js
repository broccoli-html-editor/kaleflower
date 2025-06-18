import jQuery from "jquery";
const $ = jQuery;

/**
 * ColorPalettesEditor
 */
export class ColorPalettesEditor {
	#$body;
	#globalState;
	#utils;

	constructor(params) {
		this.#$body = params.$body;
		this.#globalState = params.globalState;
		this.#utils = params.utils;

		// 初期表示
		this.#init();
	}

	/**
	 * 初期表示
	 */
	#init () {
		// TODO: ここに カラーパレット編集機能を実装する
	};

	/**
	 * カラーパレットデータを取得する
	 */
	get () {
		return { colorPalettes: {}, hasErrors: false };
	};
};

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
	}

	// カラーパレットデータを収集
	collectColorPalettesData () {
		return { colorPalettes: {}, hasErrors: false };
	};
};

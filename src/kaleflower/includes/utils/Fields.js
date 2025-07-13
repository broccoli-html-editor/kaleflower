import systemFields from "./../../../../data/system_fields.xml";
import systemFieldsImage from "./../../../../data/system_fields_image.xml";

export class Fields {

	/** Utility */
	#utils;

	#system_fields;
	#custom_fields;

	/**
	 * Constructor
	 */
	constructor(utils) {
		this.#utils = utils;

		this.#system_fields = {};
		this.#custom_fields = {};

		// DOMParserオブジェクトの作成
		const domParser = new DOMParser();

		// XML文字列をパースして、DOMオブジェクトに変換
		const kflowMerger = (fields) => {
			const xml = domParser.parseFromString(fields, "application/xml");
			const Fields = xml.querySelectorAll('fields>field');
			Fields.forEach((Field, index) => {
				const $parsed_field = this.#parse_field(Field);
				const FieldType = $parsed_field.type;
				this.#system_fields[FieldType] = $parsed_field;
			});
		};
		kflowMerger(systemFields, "application/xml");
		kflowMerger(systemFieldsImage, "application/xml");
	}

	add_field(Field){
		const $parsed_field = this.#parse_field(Field);
		const FieldType = $parsed_field.type;
		this.#custom_fields[FieldType] = $parsed_field;
		return;
	}

	#parse_field(field){
		const $rtn = {
			"type": field.getAttribute('type'),
			"format": field.getAttribute('format'),
			"editor": null,
			"style": '',
			"styleLight": '',
			"styleDark": '',
			"onload": function(){},
		};

		const templateNodes = field.getElementsByTagName('editor');
		if(templateNodes.length){
			$rtn.editor = templateNodes[0].textContent || null;
		}

		const styleNodes = field.getElementsByTagName('style');
		if(styleNodes.length){
			// styleNodes配列をループして、appearance属性に基づいて振り分け
			Array.from(styleNodes).forEach(styleNode => {
				const appearance = styleNode.getAttribute('appearance');
				const styleContent = styleNode.textContent || '';
				
				if (appearance === 'light') {
					$rtn.styleLight += styleContent;
				} else if (appearance === 'dark') {
					$rtn.styleDark += styleContent;
				} else {
					$rtn.style += styleContent;
				}
			});
		}

		const strFunctionOnEditorLoad = field.querySelector('script[function="onload"]');
		if( strFunctionOnEditorLoad ){
			$rtn.onload = eval(`(${strFunctionOnEditorLoad.textContent})`) || function(){};
		}

		return $rtn;
	}

	get_system_fields(){
		return this.#system_fields;
	}

	get_custom_fields(){
		return this.#custom_fields;
	}

	get_field($type){
		return this.#custom_fields[$type] || this.#system_fields[$type] || null;
	}
};

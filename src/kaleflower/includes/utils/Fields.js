import systemFields from "./../../../../data/system_fields.xml";

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
		const xml = domParser.parseFromString(systemFields, "application/xml");
		const Fields = xml.querySelectorAll('fields>field');
		Fields.forEach((Field, index) => {
			const $parsed_field = this.#parse_field(Field);
			const FieldType = $parsed_field.type;
			this.#system_fields[FieldType] = $parsed_field;
		});
	}

	add_field(Field){
		const $parsed_field = this.#parse_field(Field);
		const FieldType = $parsed_field.type;
		this.#custom_fields[FieldType] = $parsed_field;
		return;
	}

	#parse_field(field){
		const fieldType = field.getAttribute('type');
		const $rtn = {
			"type": fieldType,
			"ui": null,
		};

		const templateNodes = field.getElementsByTagName('ui');
		if(templateNodes.length){
			$rtn.ui = templateNodes[0].textContent || null;
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

import systemComponents from "./../../../../data/system_components.xml";

export class Components {

	/** Utility */
	#utils;

	#system_components;
	#custom_components;

	/**
	 * Constructor
	 */
	constructor(utils) {
		this.#utils = utils;

		this.#system_components = {};
		this.#custom_components = {};

		// DOMParserオブジェクトの作成
		const domParser = new DOMParser();

		// XML文字列をパースして、DOMオブジェクトに変換
		const xml = domParser.parseFromString(systemComponents, "application/xml");
		const components = xml.querySelectorAll('components>component');
		components.forEach((component, index) => {
			const $parsed_component = this.#parse_component(component);
			const componentTagName = $parsed_component.tagName;
			this.#system_components[componentTagName] = $parsed_component;
		});
	}

	add_component(component){
		const $parsed_component = this.#parse_component(component);
		const componentTagName = $parsed_component.tagName;
		this.#custom_components[componentTagName] = $parsed_component;
		return;
	}

	#parse_component(component){
		const componentTagName = component.getAttribute('name');
		const $rtn = {
			"tagName": componentTagName,
			"isVoidElement": this.#utils.to_boolean(component.getAttribute('is-void-element')),
		};
		return $rtn;
	}

	get_system_components(){
		return this.#system_components;
	}

	get_custom_components(){
		return this.#custom_components;
	}

	get_component($tagName){
		return this.#custom_components[$tagName] || this.#system_components[$tagName] || null;
	}
};
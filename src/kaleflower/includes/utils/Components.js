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
			"label": component.getAttribute('label') || `<${componentTagName}>`,
			"isVoidElement": this.#utils.toBoolean(component.getAttribute('is-void-element')),
			"canSetCss": this.#utils.toBoolean(component.getAttribute('can-set-css')),
			"canSetClass": this.#utils.toBoolean(component.getAttribute('can-set-class')),
			"canSetWidth": this.#utils.toBoolean(component.getAttribute('can-set-width')),
			"canSetHeight": this.#utils.toBoolean(component.getAttribute('can-set-height')),
			"canSetContentsDirection": this.#utils.toBoolean(component.getAttribute('can-set-contents-direction')),
			"canSetScrollable": this.#utils.toBoolean(component.getAttribute('can-set-scrollable')),
			"canBeLayer": this.#utils.toBoolean(component.getAttribute('can-be-layer')),
			"fields": [],
			"template": null,
		};

		const fieldNodes = component.querySelectorAll('fields>field');
		if(fieldNodes.length){
			fieldNodes.forEach((field, index) => {
				$rtn.fields.push({
					"name": field.getAttribute('name'),
					"type": field.getAttribute('type'),
					"label": field.getAttribute('label'),
					"default": field.getAttribute('default'),
				});
			});
		}

		const templateNodes = component.getElementsByTagName('template');
		if(templateNodes.length){
			$rtn.template = templateNodes[0].textContent || null;
		}

		const styleNodes = component.getElementsByTagName('style');
		if(styleNodes.length){
			$rtn.style = styleNodes[0].textContent || null;
		}

		return $rtn;
	}

	get_system_components(){
		return this.#system_components;
	}

	get_custom_components(){
		return this.#custom_components;
	}

	get_component($tagName){
		let $component = null;
		$component = this.#custom_components[$tagName];
		if( $component ){
			return $component;
		}
		$component = this.#system_components[$tagName];
		if( $component ){
			return $component;
		}
		$component = {
			"tagName": $tagName,
			"label": `<${$tagName}>`,
			"isVoidElement": false,
			"canSetClass": true,
			"canSetWidth": true,
			"canSetHeight": true,
			"canSetContentsDirection": true,
			"canSetScrollable": true,
			"canBeLayer": false,
			"fields": [],
			"template": null,
		};
		return $component;
	}
};

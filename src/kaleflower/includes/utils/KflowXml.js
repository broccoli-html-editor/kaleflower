import utils79 from 'utils79';
import {Components} from "./Components.js";
import {Assets} from "./Assets.js";
import {Fields} from "./Fields.js";

export class KflowXml {
	/** Utility */
	#utils;

	/**
	 * Constructor
	 */
	constructor(utils) {
		this.#utils = utils;
	}

	/**
	 * Kflow形式のXMLを出力する
	 */
	StateToKflowXml(globalState){
		let finalXml = '<?xml version="1.0" encoding="UTF-8"?>\n';

		finalXml += '<kflow>\n';
		finalXml += '	<configs>\n';
		finalXml += '		<config name="id" value="'+globalState.configs.id+'" />\n';
		finalXml += '	</configs>\n';
		finalXml += '	<styles>\n';

		let tmpHtmlAll = '';
		Object.keys(globalState.contents).forEach((key) => {
			const content = globalState.contents[key];
			const serializer = new XMLSerializer();
			const serializedXML = serializer.serializeToString(content);
			tmpHtmlAll += serializedXML + "\n";
		});

		Object.keys(globalState.styles).forEach((key) => {
			// XMLSerializerを使ってDOMツリーをXML文字列に変換
			if(!tmpHtmlAll.match(`class="${key}`)){
				return;
			}
			const style = globalState.styles[key];
			const serializer = new XMLSerializer();
			const serializedXML = serializer.serializeToString(style);
			finalXml += '		' + serializedXML + "\n";
		});
		finalXml += '	</styles>\n';
		finalXml += '	<contents>\n';
		Object.keys(globalState.contents).forEach((key) => {
			// XMLSerializerを使ってDOMツリーをXML文字列に変換
			const content = globalState.contents[key];
			const serializer = new XMLSerializer();
			const serializedXML = serializer.serializeToString(content);
			finalXml += '		' + serializedXML + "\n";
		});
		finalXml += '	</contents>\n';

		finalXml += '	<assets>\n';
		const assets = globalState.assets.getAssets();
		Object.keys(assets).forEach((key) => {
			const asset = assets[key];
			finalXml += '		<asset id="' + asset.id + '"';
			finalXml += ' ext="' + asset.ext + '"';
			finalXml += ' size="' + asset.size + '"';
			// finalXml += ' md5="' + asset.md5 + '"';
			finalXml += ' is-private-material="' + asset.isPrivateMaterial + '"';
			finalXml += ' public-filename="' + asset.publicFilename + '"';
			finalXml += ' field="' + asset.field + '"';
			finalXml += ' field-note="' + asset.fieldNote + '"';
			finalXml += ' base64="' + asset.base64 + '"';
			finalXml += ' />\n';
		});
		finalXml += '	</assets>\n';

		finalXml += '	<fields>\n';
		const fields = globalState.fields.get_custom_fields();
		Object.keys(fields).forEach((key) => {
			const field = fields[key];
			finalXml += '		<field type="' + key + '"';
			finalXml += '>';
			if(field.template){
				finalXml += "\n";
				finalXml += '			<template><![CDATA['+field.template+']]></template>'+"\n";
			}
			finalXml += '</field>\n';
		});
		finalXml += '	</fields>\n';

		finalXml += '	<components>\n';
		const components = globalState.components.get_custom_components();
		Object.keys(components).forEach((key) => {
			const component = components[key];
			finalXml += '		<component name="' + key + '"';
			finalXml += ' is-void-element="' + (component.isVoidElement ? 'true' : 'false') + '"';
			finalXml += ' can-set-class="' + (component.canSetClass ? 'true' : 'false') + '"';
			finalXml += ' can-set-width="' + (component.canSetWidth ? 'true' : 'false') + '"';
			finalXml += ' can-set-height="' + (component.canSetHeight ? 'true' : 'false') + '"';
			finalXml += '>';
			if(component.template){
				finalXml += "\n";
				finalXml += '			<template><![CDATA['+component.template+']]></template>'+"\n";
			}
			finalXml += '</component>\n';
		});
		finalXml += '	</components>\n';

		finalXml += '</kflow>\n';
		return finalXml;
	}

	/**
	 * Kflow形式のXMLを読み込んでstateを再現する
	 */
	async XmlToState(srcXml){
		let newGlobalState = {
		};
		return new Promise((rlv, rjt) => {
			// DOMParserオブジェクトの作成
			const domParser = new DOMParser();

			// XML文字列をパースして、DOMオブジェクトに変換
			const xml = domParser.parseFromString(srcXml, "application/xml");

			// --------------------------------------
			// コンフィグを抽出
			newGlobalState.configs = {};
			const configs = xml.querySelectorAll('kflow>configs>config');
			configs.forEach((config, index) => {
				newGlobalState.configs[config.getAttribute('name')] = config.getAttribute('value');
			});
			newGlobalState.configs.id = newGlobalState.configs.id || this.#utils.createUUID();

			// --------------------------------------
			// スタイルシートを抽出
			newGlobalState.styles = {};
			const styles = xml.querySelectorAll('kflow>styles>style');
			styles.forEach((style, index) => {
				newGlobalState.styles[style.getAttribute('class')] = style;
			});

			// --------------------------------------
			// カスタムフィールドを抽出
			newGlobalState.fields = new Fields(this.#utils);

			// --------------------------------------
			// コンポーネントを抽出
			newGlobalState.components = new Components(this.#utils);
			const components = xml.querySelectorAll('kflow>components>component');
			components.forEach((component, index) => {
				newGlobalState.components.add_component(component);
			});

			// --------------------------------------
			// アセットを抽出
			newGlobalState.assets = new Assets(this.#utils);
			const assets = xml.querySelectorAll('kflow>assets>asset');
			assets.forEach((asset, index) => {
				newGlobalState.assets.restoreAsset(asset);
			});

			// --------------------------------------
			// コンテンツを抽出
			newGlobalState.contents = {};
			const contents = xml.querySelectorAll('kflow>contents>content');
			contents.forEach((content, index) => {
				const contentAreaName = (()=>{
					let contentAreaName = content.getAttribute('name');
					if( typeof(contentAreaName) != typeof("string") || !contentAreaName.length ){
						contentAreaName = 'main';
					}
					return contentAreaName;
				})();
				newGlobalState.contents[contentAreaName] = content;
			});

			rlv(newGlobalState);
		});
	}
};

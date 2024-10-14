import {Components} from "./Components.js";

export class Utils {

	/**
	 * 文字列を真偽値に変換する
	 * @param string $val 変換する文字列
	 * @return boolean 変換された真偽値
	 */
	to_boolean($val){
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

	createUUID(){
		return "uuid-"+((new Date).getTime().toString(16)+Math.floor(1E7*Math.random()).toString(16));
	}

	appendChild(targetElement, newChildElementTagName){
		const newChild = document.createElementNS('', newChildElementTagName);
		newChild.kaleflowerNodeId = this.createUUID();
		targetElement.appendChild(newChild);
		return newChild;
	}

	StateToKflowXml(globalState){
		let finalXml = '<?xml version="1.0" encoding="UTF-8"?>\n';

		finalXml += '<kflow>\n';
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
		finalXml += '	</assets>\n';

		finalXml += '	<components>\n';
		const components = globalState.components.get_custom_components();
		Object.keys(components).forEach((key) => {
			const component = components[key];
			finalXml += '		<component name="' + key + '"';
			finalXml += ' is-void-element="' + (component.isVoidElement ? 'true' : 'false') + '"';
			finalXml += '>';
			finalXml += '</component>\n';
		});
		finalXml += '	</components>\n';

		finalXml += '</kflow>\n';
		return finalXml;
	}

	async XmlToState(srcXml){
		let newGlobalState = {
		};
		return new Promise((rlv, rjt) => {
			// DOMParserオブジェクトの作成
			const domParser = new DOMParser();

			// XML文字列をパースして、DOMオブジェクトに変換
			const xml = domParser.parseFromString(srcXml, "application/xml");

			// --------------------------------------
			// コンポーネントを抽出
			newGlobalState.components = new Components(this);
			const components = xml.querySelectorAll('kflow>components>component');
			components.forEach((component, index) => {
				newGlobalState.components.add_component(component);
			});

			// --------------------------------------
			// アセットを抽出
			newGlobalState.assets = {};
			const assets = xml.querySelectorAll('kflow>assets>asset');
			assets.forEach((asset, index) => {
				const assetName = (()=>{
					let assetName = asset.getAttribute('name');
					if( typeof(assetName) != typeof("string") || !assetName.length ){
						assetName = '';
					}
					return assetName;
				})();
				newGlobalState.assets[assetName] = {
					"name": assetName,
				};
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

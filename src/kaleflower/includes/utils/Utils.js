export class Utils {

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
		Object.keys(globalState.components).forEach((key) => {
			finalXml += '		<component name="' + key + '"></component>\n';
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
			newGlobalState.components = {};
			const components = xml.querySelectorAll('kflow>components>component');
			components.forEach((component, index) => {
				const componentTagName = component.getAttribute('name');
				newGlobalState.components[componentTagName] = {
					"tagName": componentTagName,
				};
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

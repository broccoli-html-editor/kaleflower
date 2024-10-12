export class KflowXmlParser {
	async toState (srcXml) {
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

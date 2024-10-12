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
			const components = xml.querySelectorAll('kflow>components>component');
			newGlobalState.components = {};
			components.forEach((component, index) => {
				const componentTagName = component.getAttribute('name');
				newGlobalState.components[componentTagName] = {
					'tagName': componentTagName,
				};
			});

			rlv(newGlobalState);
		});
	}
};

export class KflowXmlBuilder {
	toKflowXml (globalState) {
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
};

import utils79 from 'utils79';
import previewContents from 'raw-loader!./previewContents.js';

export class PreviewController {

	/**
	 * Constructor
	 */
	constructor(){
	}

	/**
	 * プレビュー画面をリフレッシュする
	 * @param {*} globalState
	 * @param {*} iframeElement 
	 * @param {*} dist 
	 */
	async refresh (globalState, iframeElement, dist) {
		const $ = globalState.jQuery;
		const $iframe = $(iframeElement);
		const isPreviewStandby = iframeElement.getAttribute("data-kaleflower-preview-status");

		return new Promise((resolve) => {
			if(isPreviewStandby){
				resolve();
				return;
			}

			// --------------------------------------
			// プレビュー画面を初期化
			const iFrameDocument = iframeElement.contentWindow.document;
			iFrameDocument.open();
			iFrameDocument.write(this.#generateDefaultPreviewContents(dist));
			iFrameDocument.close();

			setTimeout(() => {
				resolve();
			}, 200);
		}).then(() => { return new Promise((resolve) => {
			if(isPreviewStandby){
				resolve();
				return;
			}

			// --------------------------------------
			// プレビュー画面のPostMessageを初期化
			const targetWindowOrigin = this.#getTargetOrigin(iframeElement);
			const win = iframeElement.contentWindow;
			const base64 = new Buffer(previewContents).toString('base64');

			const event = document.createEvent("Event");
			event.initEvent("message", false, false);
			event.data = {'scriptUrl':'data:text/javascript;base64,'+base64};
			event.origin = targetWindowOrigin;
			win.dispatchEvent(event);

			resolve();
		});
		}).then(() => { return new Promise((resolve) => {
			$iframe.attr({"data-kaleflower-preview-status": true});
			console.log('preview: refreshed');
			resolve();
		});
		});
	}

	/**
	 * iframeコンテンツのoriginを取得する
	 * @param {*} iframe 
	 * @returns 
	 */
	#getTargetOrigin(iframe){
		if(window.location.origin=='file://' || window.location.origin.match(/^chrome\-extension\:\/\//)){
			return '*';
		}

		const url = iframe.getAttribute('src');
		if(url == 'about:blank'){
			return window.location.origin;
		}
		const parser = document.createElement('a');
		parser.href=url;
		return parser.protocol+'//'+parser.host;
	}

	/**
	 * デフォルトのプレビュー画面のコンテンツを生成する
	 * プレビューURLを与えられなかった場合に使用されるHTMLのベースコード。
	 * @param {*} dist 
	 * @returns 
	 */
	#generateDefaultPreviewContents(dist){
		let rtn = '';
		rtn += `<!DOCTYPE html>
<html>
<head>
<style>${dist.css}</style>
</head>
<body>
`;
		Object.keys(dist.html).forEach((key) => {
			rtn += `<div class="contents">${dist.html[key]}</div>`;
		});
		rtn += `<script>${dist.js}</script>
<script>
window.addEventListener('load', function(e){
	console.log('preview window: loaded');
});
</script>
<script data-kaleflower-receive-message="yes">
window.addEventListener('message',(function() {
return function f(event) {
if(!event.data.scriptUrl){return;}
if(event.origin!='${window.location.origin}'){return;}
var s=document.createElement('script');
document.querySelector('body').appendChild(s);s.src=event.data.scriptUrl;
window.removeEventListener('message', f, false);
}
})(),false);
</script>
</body>
</html>
`;
		return rtn;
	}
};

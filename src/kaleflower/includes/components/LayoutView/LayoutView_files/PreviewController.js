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

		return new Promise((resolve) => {

			console.log('$iframe:', iframeElement);

			const isPreviewStandby = iframeElement.getAttribute("data-kaleflower-preview-status");

			console.log('data-kaleflower-preview-status:', isPreviewStandby);

			if(isPreviewStandby){
				resolve();
				return;
			}

			iframeElement.contentWindow.document.open();
			iframeElement.contentWindow.document.write(this.#generateDefaultPreviewContents(dist));
			iframeElement.contentWindow.document.close();

			$iframe.attr({"data-kaleflower-preview-status": true});

			resolve();
		}).then(() => {
			return new Promise((resolve) => {
				resolve();
			});
		});
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

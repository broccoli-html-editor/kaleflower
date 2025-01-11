import utils79 from 'utils79';
import previewContents from 'raw-loader!./previewContents.js';

export class PreviewController {
	#globalState;
	#iframeElement;
	#callbackMemory = {};

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
		this.#globalState = globalState;
		this.#iframeElement = iframeElement;
		const $ = this.#globalState.jQuery;
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
		})
		.then(() => { return new Promise((resolve) => {
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

			setTimeout(() => {
				resolve();
			}, 200);
		});})
		.then(() => { return new Promise((resolve) => {
			if(isPreviewStandby){
				resolve();
				return;
			}

			this.#setupOnMessageEvent();
			resolve();
		});})
		.then(() => { return new Promise((resolve, reject) => {
			var timeout = setTimeout(() => {
				console.error('postMessenger: ping error: Timeout');
				reject();
			}, 5000);
			this.#send('ping', {}, (res) => {
				try {
					if( !res.result ){
						console.error('postMessenger: ping got a error', res);
					}

				} catch(e) {
					console.error('postMessenger: ping problem:', e);
				}
				clearTimeout(timeout);
				resolve();
			});
		});})
		.then(() => { return new Promise((resolve) => {

			// スタンバイ完了を宣言する
			$iframe.attr({"data-kaleflower-preview-status": true});

			console.log('preview: refreshed');
			resolve();
		});});
	}

	/**
	 * 新しいUUIDを生成する
	 * @returns {String} UUID
	 */
	#createUUID(){
		return "uuid-"+((new Date).getTime().toString(16)+Math.floor(1E7*Math.random()).toString(16));
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


	/**
	 * メッセージを送る
	 */
	#send(api, options, callback){
		const iframe = this.#iframeElement;
		const $ = this.#globalState.jQuery;
		callback = callback||function(){};

		var callbackId = this.#createUUID();

		this.#callbackMemory[callbackId] = callback; // callbackは送信先から呼ばれる。

		var message = {
			'api': api,
			'callback': callbackId,
			'options': options
		};

		var win = $(iframe).get(0).contentWindow;
		var targetWindowOrigin = this.#getTargetOrigin(iframe);

		try {
			var event;
			event = document.createEvent("Event");
			event.initEvent("message", false, false);
			event.data = message;
			event.origin = targetWindowOrigin;
			win.dispatchEvent(event);
		}catch(e){
			win.postMessage(message, targetWindowOrigin);
		}

		return;
	}

	/**
	 * メッセージを受信する
	 */
	#setupOnMessageEvent(){
		const callbackMemory = this.#callbackMemory;
		window.addEventListener('message',function(event){
			var data=event.data;

			if(data.api == 'unselectInstance'){
				broccoli.unselectInstance();
				return;

			}else if(data.api == 'unfocusInstance'){
				broccoli.unfocusInstance();
				return;

			}else if(data.api == 'onClickContentsLink'){
				var data = event.data.options;
				broccoli.options.onClickContentsLink(data.url, data);
				return;

			}else if(data.api == 'adjustPanelsPosition'){
				broccoli.adjust();
				return;

			}else{
				if(!callbackMemory[data.api]){return;}
				callbackMemory[data.api](data.options);
				callbackMemory[data.api] = undefined;
				delete callbackMemory[data.api];
			}
			return;

		});
	}
};

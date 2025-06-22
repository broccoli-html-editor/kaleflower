import utils79 from 'utils79';
import previewContents from 'raw-loader!./dist/previewContents.js';

export class PreviewController {
	#globalState;
	#iframeElement;
	#events = {};
	#callbackMemory = {};

	/**
	 * Constructor
	 */
	constructor(){
	}

	/**
	 * イベントハンドラを登録する
	 * @param {*} eventName 
	 * @param {*} callback 
	 * @returns 
	 */
	on (eventName, callback) {
		this.#events[eventName] = callback;
		return this;
	}

	/**
	 * イベントを発火する
	 * @param {*} eventName 
	 * @param {*} data 
	 * @returns 
	 */
	trigger (eventName, data) {
		this.#events[eventName]({
			...data,
			type: eventName,
		});
		return this;
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
		const isProgress = iframeElement.getAttribute("data-kaleflower-update-progress");
		if(isProgress){
			return;
		}
		const isPreviewStandby = iframeElement.getAttribute("data-kaleflower-preview-status");

		$iframe.attr({"data-kaleflower-update-progress": true});

		return new Promise((resolve) => {
			if(isPreviewStandby){
				resolve();
				return;
			}

			let timeout = setTimeout(() => {
				resolve();
			}, 2000);

			$(iframeElement.contentWindow).on('load', (event) => {
				clearTimeout(timeout);
				resolve();
			});

			// --------------------------------------
			// プレビュー画面を初期化
			if(!this.#globalState.options.urlLayoutViewPage || this.#globalState.options.urlLayoutViewPage == 'about:blank'){
				const iFrameDocument = iframeElement.contentWindow.document;
				iFrameDocument.open();
				iFrameDocument.write(this.#generateDefaultPreviewContents(dist));
				iFrameDocument.close();
			}

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

			this.#bindOnMessageEvent();
			resolve();
		});})
		.then(() => { return new Promise((resolve, reject) => {
			if(isPreviewStandby){
				resolve();
				return;
			}

			var timeout = setTimeout(() => {
				console.error('postMessenger: ping error: Timeout');
				reject();
			}, 5000);
			this.sendMessageToIframe('ping', {}, (res) => {
				try {
					if( !res.result ){
						console.error('postMessenger: ping got an error', res);
					}

				} catch(e) {
					console.error('postMessenger: ping problem:', e);
				}
				clearTimeout(timeout);
				resolve();
			});
		});})
		.then(() => { return new Promise((resolve, reject) => {
			if(isPreviewStandby){
				resolve();
				return;
			}

			this.sendMessageToIframe('removeScriptReceiver', {
				scriptReceiverSelector: this.#globalState.options.scriptReceiverSelector || '[data-kaleflower-receive-message="yes"]',
			}, (res) => {
				try {
					if( !res.result ){
						console.error('postMessenger: removeScriptReceiver got a error', res);
					}

				} catch(e) {
					console.error('postMessenger: removeScriptReceiver problem:', e);
				}
				resolve();
			});
		});})
		.then(() => { return new Promise((resolve, reject) => {
			this.sendMessageToIframe('updateHtml', {
				html: dist.html,
				css: dist.css,
				js: dist.js,
				contentsAreaSelector: this.#globalState.options.contentsAreaSelector || '[data-kaleflower-contents-bowl-name]',
				contentsContainerNameBy: this.#globalState.options.contentsContainerNameBy || 'data-kaleflower-contents-bowl-name',
			}, (res) => {
				try {
					if( !res.result ){
						console.error('postMessenger: updateHtml got an error', res);
					}

				} catch(e) {
					console.error('postMessenger: updateHtml problem:', e);
				}
				resolve();
			});
		});})
		.then(() => { return new Promise((resolve, reject) => {
			this.sendMessageToIframe('getBowlList', {
				contentsAreaSelector: this.#globalState.options.contentsAreaSelector || '[data-kaleflower-contents-bowl-name]',
				contentsContainerNameBy: this.#globalState.options.contentsContainerNameBy || 'data-kaleflower-contents-bowl-name',
			}, (res) => {
				try {
					if( !res ){
						console.error('postMessenger: getBowlList got an error', res);
					}
				} catch(e) {
					console.error('postMessenger: getBowlList problem:', e);
				}
				this.trigger('bowlListUpdated', {
					bowlList: res,
				});
				resolve();
			});
		});})
		.then(() => { return new Promise((resolve) => {

			// スタンバイ完了を宣言する
			$iframe.attr({"data-kaleflower-preview-status": true});
			$iframe.removeAttr("data-kaleflower-update-progress");

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
</head>
<body>
`;
		Object.keys(dist.html).forEach((key) => {
			rtn += `<div class="contents" data-kaleflower-contents-bowl-name="${key}"></div>`;
		});
		rtn += `
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
	 * メッセージをiframe内に送る
	 */
	sendMessageToIframe(api, options, callback){
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

		var win = iframe.contentWindow;
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
	 * メッセージの受信ハンドラを割り当てる
	 */
	#bindOnMessageEvent(){
		const callbackMemory = this.#callbackMemory;
		window.addEventListener('message', (event) => {
			var data=event.data;

			if(data.api == 'unselectInstance'){
				// TODO: KaleFlowerの処理に書き換える。
				// broccoli.unselectInstance();
				return;

			}else if(data.api == 'unfocusInstance'){
				// TODO: KaleFlowerの処理に書き換える。
				// broccoli.unfocusInstance();
				return;

			}else if(data.api == 'onClickContentsLink'){
				var data = event.data.options;
				// TODO: KaleFlowerの処理に書き換える。
				// broccoli.options.onClickContentsLink(data.url, data);
				return;

			}else if(data.api == 'adjustPanelsPosition'){
				this.trigger('adjustPanelsPosition', {
					panels: data.options.panels,
					window: data.options.window,
				});
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

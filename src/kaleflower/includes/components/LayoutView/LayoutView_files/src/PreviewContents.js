import $ from 'jquery';
import {PanelsInfo} from './includes/PanelsInfo.js';

(function(){
	const panelsInfo = new PanelsInfo($);
	var $iframeWindowDocument = $(window.document);
	var _origin;

	// クリックイベントを登録
	$iframeWindowDocument.on('click', function(){
		callbackMessage('unselectInstance');
		callbackMessage('unfocusInstance');
	});

	// dropイベントをキャンセル
	$iframeWindowDocument.on('dragover', function(e){
		e.stopPropagation();
		e.preventDefault();
		return;
	}).on('drop', function(e){
		e.stopPropagation();
		e.preventDefault();
		return;
	});

	function callbackMessage(callbackId, data){
		if(!_origin){return;}
		if(typeof(callbackId)!==typeof('')){return;}

		try {
			var event;
			event = document.createEvent("Event");
			event.initEvent("message", false, false);
			event.data = {
				'api':callbackId ,
				'options': data
			};
			event.origin = _origin;
			window.parent.dispatchEvent(event);
		}catch(e){
			window.parent.postMessage(
				{
					'api':callbackId ,
					'options': data
				},
				_origin
			);
		}
	}

	function resetPreviewDomElements(){
		$('body *').attr({'tabindex':'-1'}).css({'outline':'none'});
		$('img').off("load").on("load", function() {
			const instances = panelsInfo.collectInstance();
			callbackMessage('adjustPanelsPosition', {
				'panels': instances,
			} );
			return;
		});
	}

	function getInstance($this){
		var elm = {};
		elm.instancePath = $this.attr('data-broccoli-instance-path');
		elm.modId = $this.attr('data-broccoli-mod-id');// <- このidは、コンテンツデータ由来なので、実際にはinternalIdを扱っている。が、名前は id でよい。
		elm.subModName = $this.attr('data-broccoli-sub-mod-name');
		elm.isAppender = ($this.attr('data-broccoli-is-appender') == 'yes');
		elm.areaSizeDetection = $this.attr('data-broccoli-area-size-detection');
		elm.modName = $this.attr('data-broccoli-module-name');
		elm.offsetLeft = $this.offset().left;
		elm.offsetTop = $this.offset().top;
		elm.outerWidth = elm.offsetLeft + $this.outerWidth();
		elm.outerHeight = elm.offsetTop + $this.outerHeight();
		if( elm.areaSizeDetection == 'deep' ){
			$this.find('*').each(function(){
				var $this = $(this);
				if( $this.is(":hidden") ){
					return;
				}
				var oL = $this.offset().left;
				var oT = $this.offset().top;
				var oW = oL + $this.outerWidth();
				var oH = oT + $this.outerHeight();
				if( elm.offsetLeft > oL ){
					elm.offsetLeft = oL;
				}
				if( elm.offsetTop > oT ){
					elm.offsetTop = oT;
				}
				if( elm.outerWidth < oW ){
					elm.outerWidth = oW;
				}
				if( elm.outerHeight < oH ){
					elm.outerHeight = oH;
				}
			});
		}
		elm.outerWidth = elm.outerWidth - elm.offsetLeft;
		elm.outerHeight = elm.outerHeight - elm.offsetTop;
		elm.visible = true;
		if( $this.is(":hidden") ){
			elm.visible = false;
		}
		return elm;
	}

	window.addEventListener('message',function(event){
		var data=event.data;
		_origin = event.origin;

		if(data.api == 'ping'){
			callbackMessage(data.callback, {
				"result": true,
				"message": "OK"
			});
			return;
		}else if(data.api == 'removeScriptReceiver'){
			const scriptElement = document.querySelector(`${data.options.scriptReceiverSelector||'[data-kaleflower-receive-message="yes"]'}`);
			if(scriptElement){scriptElement.parentNode.removeChild(scriptElement);}

			callbackMessage(data.callback, {
				"result": true,
				"message": "OK"
			});
			return;
		}else if(data.api == 'updateHtml'){
			var html = data.options.html;
			$iframeWindowDocument
				.find(data.options.contentsAreaSelector)
				.html('...')
				.each(function(){
					var $this = $(this);
					var bowlName = $this.attr(data.options.contentsContainerNameBy);
					if(!bowlName){ bowlName = 'main'; }
					if(html[bowlName]){
						$this.html(html[bowlName]);
						html[bowlName] = undefined;
						delete html[bowlName];
					}
				})
			;

			$('[data-kaleflower-assets-placeholser]').remove();

			const styleElement = document.createElement('style');
			styleElement.setAttribute('data-kaleflower-assets-placeholser', true);
			styleElement.innerHTML = data.options.css;
			$('head').append(styleElement);

			const scriptElement = document.createElement('script');
			scriptElement.setAttribute('data-kaleflower-assets-placeholser', true);
			scriptElement.innerHTML = data.options.js;
			$('body').append(scriptElement);

			resetPreviewDomElements();
			callbackMessage(data.callback, {
				"result": true,
				"message": "OK"
			});
			return;

		}else if(data.api == 'getInstancePositions'){
			let rtn = {};
			data.options.instances.forEach((instanceId) => {
				var $instance = $iframeWindowDocument.find(`[data-kaleflower-instance-id="${instanceId}"]`);
				rtn[instanceId] = {
					'instanceId': instanceId,
					'offsetTop': $instance.offset().top,
					'offsetLeft': $instance.offset().left,
					'width': $instance.outerWidth(),
					'height': $instance.outerHeight(),
				};
			});
			callbackMessage(data.callback, rtn);
			return;

		}else if(data.api == 'getAllInstance'){
			const instances = panelsInfo.collectInstance();
			callbackMessage(data.callback, instances);
			return;

		}else if(data.api == 'getHtmlContentHeightWidth'){
			var hw = {};
			hw.h = Math.max.apply( null, [document.body.clientHeight, document.body.scrollHeight, document.documentElement.scrollHeight, document.documentElement.clientHeight] );
			hw.w = Math.max.apply( null, [document.body.clientWidth, document.body.scrollWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth] );
			callbackMessage(data.callback, hw);
			return;

		}else if(data.api == 'getBowlList'){
			var bowls = [];
			$iframeWindowDocument
				.find(data.options.contentsAreaSelector)
				.each(function(){
					var $this = $(this);
					var bowlName = $this.attr(data.options.contentsContainerNameBy);
					if( typeof(bowlName) !== typeof('') || !bowlName.length ){
						bowlName = 'main';// <- default bowl name
					}
					bowls.push(bowlName);
				})
			;
			callbackMessage(data.callback, bowls);
			return;

		}else if(data.api == 'scrollTo'){
			$(window).scrollTop(data.options.scrollTop);
			return;

		}else{
			callbackMessage(data.callback, {
				"result": false,
				"message": "Unknown API."
			});
			return;
		}
		return;
	});

	$iframeWindowDocument.on("click", "a", function() {
		var data = {};
		var $this = $(this);
		data.url = $this.prop('href');
		data.tagName = this.tagName.toLowerCase();
		data.href = $this.attr('href');
		data.target = $this.attr('target');
		callbackMessage('onClickContentsLink', data );
		return false;
	});
	$iframeWindowDocument.find('form').on("submit", function() {
		var data = {};
		var $this = $(this);
		data.url = $this.prop('action');
		data.tagName = this.tagName.toLowerCase();
		data.action = $this.attr('action');
		data.target = $this.attr('target');
		callbackMessage('onClickContentsLink', data );
		return false;
	});
	$(window).on("resize", function() {
		const instances = panelsInfo.collectInstance();
		callbackMessage('adjustPanelsPosition', {
			'panels': instances,
		} );
		return;
	});

	resetPreviewDomElements();

})();

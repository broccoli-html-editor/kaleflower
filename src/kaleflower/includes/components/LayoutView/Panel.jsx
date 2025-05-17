import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';
import Icons from '../Icons/Icons.jsx';
import { CssParser } from '../../utils/CssParser.js';

let startScreenX = 0;
let startScreenY = 0;
let fromScreenX = 0;
let fromScreenY = 0;
let distanceX = 0;
let distanceY = 0;
let resizerMoveCallback;
let resizerEndCallback;

const addWindowEventListeners = () => {
	window.addEventListener('mousemove', handleResizeMove);
	window.addEventListener('mouseup', handleResizeEnd);
}
const removeWindowEventListeners = () => {
	window.removeEventListener('mousemove', handleResizeMove);
	window.removeEventListener('mouseup', handleResizeEnd);
}

// リサイズ処理の開始
const handleResizeStart = (e, type, callback, endCallback) => {
	e.stopPropagation();
	startScreenX = e.screenX;
	startScreenY = e.screenY;
	fromScreenX = e.screenX;
	fromScreenY = e.screenY;
	resizerMoveCallback = callback;
	resizerEndCallback = endCallback;

	// windowにイベントリスナーを追加
	addWindowEventListeners()
};

// リサイズ中の処理
const handleResizeMove = (e) => {
	distanceX = e.screenX - fromScreenX;
	distanceY = e.screenY - fromScreenY;
	fromScreenX = e.screenX;
	fromScreenY = e.screenY;
	resizerMoveCallback(distanceX, distanceY);
};

// リサイズ終了時の処理
const handleResizeEnd = () => {
	removeWindowEventListeners();
	resizerEndCallback();
	resizerEndCallback = null;
};

const Panel = React.memo((props) => {
	const globalState = useContext(MainContext);
	const panelRef = useRef(null);
	const beforeRef = useRef(null);
	const afterRef = useRef(null);
	const $ = globalState.jQuery;
	const utils = globalState.utils;

	// コンポーネントのアンマウント時にリスナーを確実に削除
	useEffect(() => {
		return () => {
			removeWindowEventListeners();
		};
	}, []);

	const currentInstance = globalState.getInstanceById(props.panelInfo.instanceId);
	const currentComponent = (currentInstance ? globalState.components.get_component(currentInstance.tagName) : null);
	const isVoidElement = (currentComponent ? currentComponent.isVoidElement : null);
	const isElementNode = (currentInstance ? !currentInstance.nodeName.match(/^\#/) : null);
	const currentClassName = (isElementNode && currentInstance ? currentInstance.getAttribute('class') : null);

	const canSetClass = (currentComponent ? currentComponent.canSetClass : null);
	const canSetWidth = (currentComponent ? currentComponent.canSetWidth : null);
	const canSetHeight = (currentComponent ? currentComponent.canSetHeight : null);
	const canSetContentsDirection = (currentComponent ? currentComponent.canSetContentsDirection : null);
	const canSetScrollable = (currentComponent ? currentComponent.canSetScrollable : null);
	const canBeLayer = (currentComponent ? currentComponent.canBeLayer : null);

	const currentBreakPoint = globalState.previewViewport.breakPoint;

	const currentStyle = (currentClassName && globalState.styles[currentClassName] ? globalState.styles[currentClassName] : null);
	const hasCssClassName = (canSetClass && currentClassName && currentStyle);
	const currentStyleBreakPoints = {};

	if (currentStyle) {
		// ブレイクポイント別の media要素を取得する
		// ない場合は作成し、初期化する。
		Object.keys(globalState.configs['break-points']).forEach((breakPointName) => {
			const breakPoint = globalState.configs['break-points'][breakPointName];
			let mediaElement = Array.from(currentStyle.children).find(child => child.getAttribute('break-point') === breakPointName);

			if (!mediaElement) {
				mediaElement = document.createElementNS('', 'media');
				mediaElement.setAttribute('break-point', breakPointName);
				currentStyle.appendChild(mediaElement);
			}
			currentStyleBreakPoints[breakPointName] = mediaElement;
		});
	}

	const cssParser = new CssParser();
	const currentStyleElement = (
		currentStyleBreakPoints[currentBreakPoint.name] ? currentStyleBreakPoints[currentBreakPoint.name]
		: currentStyle ? currentStyle : currentInstance ? currentInstance : null);
	if(currentStyleElement){
		cssParser.set(currentStyleElement, !!currentClassName, currentBreakPoint.name);
	}

	const containerDirection = (() => {
		if( props.panelInfo.parent.display == 'flex' && props.panelInfo.parent['flex-direction'] == 'row' ){
			return 'x';
		}
		if( props.panelInfo.display == 'inline' || props.panelInfo.display == 'inline-block' ){
			return 'x';
		}
		return 'y';
	})();


	/**
	 * マウス座標の四象限の位置を得る
	 */
	function getUd(e, elm){
		var posx = 0;
		var posy = 0;
		if (!e) e = window.event;
		if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		}else if (e.clientX || e.clientY) {
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		var mousepos = { x : posx, y : posy };

		var docScrolls = {
			left : document.body.scrollLeft + document.documentElement.scrollLeft,
			top : document.body.scrollTop + document.documentElement.scrollTop
		};
		var bounds = elm.getBoundingClientRect(); // 対象要素の情報取得
		var relmousepos = {
			x : mousepos.x - bounds.left - docScrolls.left,
			y : mousepos.y - bounds.top - docScrolls.top
		};

		var ud = {};
		if( relmousepos.y < $(elm).height()/3 ){
			ud.y = 'u';
		}else if( relmousepos.y > $(elm).height()/3*2 ){
			ud.y = 'd';
		}else{
			ud.y = 'c';
		}
		if( relmousepos.x < $(elm).width()/3 ){
			ud.x = 'l';
		}else if( relmousepos.x > $(elm).width()/3*2 ){
			ud.x = 'r';
		}else{
			ud.x = 'c';
		}
		return ud;
	}

	function getDirectionByUd(ud){
		let direction = 'append';
		if( props.panelInfo.isLayer ){
			return direction;
		}
		if( containerDirection == 'y' ){
			if( ud.y == 'u' ){
				direction = 'before';
			}else if( ud.y == 'd' ){
				direction = 'after';
			}
		}else{
			if( ud.x == 'l' ){
				direction = 'before';
			}else if( ud.x == 'r' ){
				direction = 'after';
			}
		}
		return direction;
	}

	function doResize(attrName, computedKey, distance){
		if(!distance){
			return;
		}
		const targetElementNode = (hasCssClassName ? (currentBreakPoint ? currentStyleBreakPoints[currentBreakPoint.name] : currentStyle) : currentInstance);
		const currentValue = cssParser.getProperty(attrName);
		let newValue = currentValue;
		if(currentValue === undefined || currentValue === null){
			const tmpCurrentPxValue = props.panelInfo[attrName];
			newValue = `${tmpCurrentPxValue + distance}px`;
		}else if(currentValue.match(/^([1-9][0-9]*)px$/)){
			const tmpCurrentPxValue = parseInt(RegExp.$1);
			newValue = `${tmpCurrentPxValue + distance}px`;
		}else if(currentValue.match(/^([1-9][0-9]*)\%$/)){
			const tmpCurrentPercentValue = parseInt(RegExp.$1);
			// TODO: パーセント指定のときの編集ロジックを追加する
			const tmpCurrentPxValue = parseInt(props.panelInfo[attrName]);
			newValue = `${tmpCurrentPxValue + distance}px`;
		}else{
			const tmpCurrentPxValue = parseInt(props.panelInfo[attrName]);
			newValue = `${tmpCurrentPxValue + distance}px`;
		}
		targetElementNode[computedKey] = newValue;
		if( newValue.length ){
			cssParser.setProperty(attrName, newValue);
		}else{
			cssParser.setProperty(attrName, null);
		}
		cssParser.save();
	}

	const panelWidth = (()=>{
		if( !props.panelInfo.nextOffsetLeft ){
			return props.panelInfo.width;
		}
		const distance = props.panelInfo.nextOffsetLeft - (props.panelInfo.offsetLeft + props.panelInfo.width);
		if( distance <= 0 ){
			return props.panelInfo.width;
		}
		return props.panelInfo.width + distance;
	})();
	const panelHeight = (()=>{
		if( !props.panelInfo.nextOffsetTop ){
			return props.panelInfo.height;
		}
		const distance = props.panelInfo.nextOffsetTop - (props.panelInfo.offsetTop + props.panelInfo.height);
		if( distance <= 0 ){
			return props.panelInfo.height;
		}
		return props.panelInfo.height + distance;
	})();

	return (
		<>
			<div
				ref={panelRef}
				className={`kaleflower-layout-view-panel`
					+ (containerDirection == 'x' ? ' kaleflower-layout-view-panel--horizontal' : '')
					+ `${globalState.selectedInstance && globalState.selectedInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view-panel--selected' : ''}`
					+ `${globalState.hoveredInstance && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view-panel--hovered' : ''}`
					+ `${globalState.hoveredInstanceDirection == 'before' && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view-panel--drag-entered-before' : ''}`
					+ `${globalState.hoveredInstanceDirection == 'after' && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view-panel--drag-entered-after' : ''}`
					+ `${globalState.hoveredInstanceDirection == 'append' && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view-panel--drag-entered-append' : ''}`
					+ `${props.panelInfo.isLayer ? ' kaleflower-layout-view-panel--layer' : ''}`
					}
				data-kaleflower-instance-id={props.panelInfo.instanceId}
				data-kaleflower-current-layer={props.panelInfo.currentLayer}
				data-kaleflower-parent-layer={props.panelInfo.parentLayer}
				data-kaleflower-is-layer={props.panelInfo.isLayer}
				style={{
					top: props.panelInfo.offsetTop,
					left: props.panelInfo.offsetLeft,
					width: panelWidth,
					height: panelHeight,
				}}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					props.onselectinstance(props.panelInfo.instanceId);
				}}
				onDoubleClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					props.onselectinstance(props.panelInfo.instanceId);
					globalState.setGlobalState((prevState) => ({
						...prevState,
						editWindowOpened: true,
					}));
				}}

				onMouseOver={(event) => {
					event.stopPropagation();
					event.preventDefault();
					props.onhoverinstance(props.panelInfo.instanceId);
				}}
				onMouseOut={(event) => {
					event.stopPropagation();
					event.preventDefault();
					props.onhoverinstance(null);
				}}

				onDragStart={(event)=>{
					event.stopPropagation();
					beforeRef.current.style.display = 'none';
					afterRef.current.style.display = 'none';
					const sendData = {
						kaleflowerInstanceId: props.panelInfo.instanceId,
					};
					event.dataTransfer.setData("text/json", JSON.stringify(sendData) );
					const onselectinstance = props.onselectinstance || function(){};
					onselectinstance(props.panelInfo.instanceId);
				}}
				onDragEnter={(event)=>{}}
				onDragOver={(event)=>{
					event.preventDefault();
					event.stopPropagation();

					const ud = getUd(event, panelRef.current);
					const direction = getDirectionByUd(ud);
					props.ondragover(props.panelInfo.instanceId, direction);
				}}
				onDragLeave={(event)=>{}}
				onDrop={(event)=>{
					event.preventDefault();
					event.stopPropagation();
					let transferData = event.dataTransfer.getData("text/json");
					try {
						transferData = JSON.parse(transferData);
					} catch (e) {}

					const ud = getUd(event, panelRef.current);
					const direction = getDirectionByUd(ud);

					const moveFromInstance = globalState.selectedInstance;
					const moveToInstance = props.panelInfo.instanceId;
					props.onmoveinstance(moveFromInstance, moveToInstance, direction);
				}}
				onDragEnd={(event)=>{}}

				draggable="true"
			>
				{globalState.hoveredInstanceDirection && globalState.hoveredInstance && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId &&
					<div className={`kaleflower-layout-view-panel__drop-to-insert-here`}></div>
				}
				{!globalState.hoveredInstanceDirection && !props.panelInfo.isLayer &&
					<>
						<div ref={beforeRef} className={`kaleflower-layout-view-panel__create-new-element-before`}>
							<button type={`button`} onClick={async (event) => {
								event.preventDefault();
								event.stopPropagation();
								props.oncreatenewinstance(props.panelInfo.instanceId, 'before');
							}}><Icons type="plus" /></button>
						</div>
						<div ref={afterRef} className={`kaleflower-layout-view-panel__create-new-element-after`}>
							<button type={`button`} onClick={async (event) => {
								event.preventDefault();
								event.stopPropagation();
								props.oncreatenewinstance(props.panelInfo.instanceId, 'after');
							}}><Icons type="plus" /></button>
						</div>
					</>
				}
			</div>
			{globalState.selectedInstance && globalState.selectedInstance.kaleflowerInstanceId == props.panelInfo.instanceId && canSetClass && canSetWidth &&
				<>
					<div
						className={`kaleflower-layout-view-panel__handle-resize-width-left`}
						style={{
							top: props.panelInfo.offsetTop,
							left: props.panelInfo.offsetLeft,
							width: 5,
							height: panelHeight,
						}}
						>
						<button
							type={`button`}
							onMouseDown={(e) => handleResizeStart(e, 'width-left', (distanceX, distanceY) => {
								$(panelRef.current).removeAttr('draggable');
								const attrName = 'width';
								const computedKey = 'kaleflowerComputedWidth';
								doResize(attrName, computedKey, -distanceX);
								props.onselectinstance(props.panelInfo.instanceId);
							}, () => {
								$(panelRef.current).attr('draggable', true);
							})}
							onClick={(e) => {e.stopPropagation();}}></button>
					</div>
					<div
						className={`kaleflower-layout-view-panel__handle-resize-width-right`}
						style={{
							top: props.panelInfo.offsetTop,
							left: props.panelInfo.offsetLeft + panelWidth - 5,
							width: 5,
							height: panelHeight,
						}}
						>
						<button
							type={`button`}
							onMouseDown={(e) => handleResizeStart(e, 'width-right', (distanceX, distanceY) => {
								$(panelRef.current).removeAttr('draggable');
								const attrName = 'width';
								const computedKey = 'kaleflowerComputedWidth';
								doResize(attrName, computedKey, distanceX);
								props.onselectinstance(props.panelInfo.instanceId);
							}, () => {
								$(panelRef.current).attr('draggable', true);
							})}
							onClick={(e) => {e.stopPropagation();}}></button>
					</div>
				</>
			}
			{globalState.selectedInstance && globalState.selectedInstance.kaleflowerInstanceId == props.panelInfo.instanceId && canSetClass && canSetHeight &&
				<>
					<div
						className={`kaleflower-layout-view-panel__handle-resize-height-top`}
						style={{
							top: props.panelInfo.offsetTop,
							left: props.panelInfo.offsetLeft,
							width: panelWidth,
							height: 5,
						}}
						>
						<button
							type={`button`}
							onMouseDown={(e) => handleResizeStart(e, 'height-top', (distanceX, distanceY) => {
								$(panelRef.current).removeAttr('draggable');
								const attrName = 'height';
								const computedKey = 'kaleflowerComputedHeight';
								doResize(attrName, computedKey, -distanceY);
								props.onselectinstance(props.panelInfo.instanceId);
							}, () => {
								$(panelRef.current).attr('draggable', true);
							})}
							onClick={(e) => {e.stopPropagation();}}></button>
					</div>
					<div
						className={`kaleflower-layout-view-panel__handle-resize-height-bottom`}
						style={{
							top: props.panelInfo.offsetTop + panelHeight - 5,
							left: props.panelInfo.offsetLeft,
							width: panelWidth,
							height: 5,
						}}
						>
						<button
							type={`button`}
							onMouseDown={(e) => handleResizeStart(e, 'height-bottom', (distanceX, distanceY) => {
								$(panelRef.current).removeAttr('draggable');
								const attrName = 'height';
								const computedKey = 'kaleflowerComputedHeight';
								doResize(attrName, computedKey, distanceY);
								props.onselectinstance(props.panelInfo.instanceId);
							}, () => {
								$(panelRef.current).attr('draggable', true);
							})}
							onClick={(e) => {e.stopPropagation();}}></button>
					</div>
				</>
			}
		</>
	);
});

export default Panel;

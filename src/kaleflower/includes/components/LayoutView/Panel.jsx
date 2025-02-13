import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';

const Panel = React.memo((props) => {
	const globalState = useContext(MainContext);
	const panelRef = useRef(null);
	const $ = globalState.jQuery;
	const utils = globalState.utils;

	useEffect(async () => {
		return () => {
		};
	}, [globalState, props]);


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
		if( relmousepos.y < $(elm).height()/2 ){
			ud.y = 'u';
		}else{
			ud.y = 'd';
		}
		if( relmousepos.x < $(elm).width()/2 ){
			ud.x = 'l';
		}else{
			ud.x = 'r';
		}
		return ud;
	}

	return (
		<div
			ref={panelRef}
			className={`kaleflower-layout-view__panel`
				+ `${globalState.selectedInstance && globalState.selectedInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view__panel--selected' : ''}`
				+ `${globalState.hoveredInstance && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view__panel--hovered' : ''}`
				+ `${globalState.hoveredInstanceDirection == 'before' && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view__panel--drag-entered-u' : ''}`
				+ `${globalState.hoveredInstanceDirection == 'after' && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view__panel--drag-entered-d' : ''}`
				}
			data-kaleflower-instance-id={props.panelInfo.instanceId}
			style={{
				top: props.panelInfo.offsetTop,
				left: props.panelInfo.offsetLeft,
				width: (()=>{
					if( !props.panelInfo.nextOffsetLeft ){
						return props.panelInfo.width;
					}
					const distance = props.panelInfo.nextOffsetLeft - (props.panelInfo.offsetLeft + props.panelInfo.width);
					if( distance <= 0 ){
						return props.panelInfo.width;
					}
					return props.panelInfo.width + distance;
				})(),
				height: (()=>{
					if( !props.panelInfo.nextOffsetTop ){
						return props.panelInfo.height;
					}
					const distance = props.panelInfo.nextOffsetTop - (props.panelInfo.offsetTop + props.panelInfo.height);
					if( distance <= 0 ){
						return props.panelInfo.height;
					}
					return props.panelInfo.height + distance;
				})(),
			}}
			onClick={(event) => {
				event.stopPropagation();
				event.preventDefault();
				props.onselectinstance(props.panelInfo.instanceId);
			}}
			onMouseOver={(event) => {
				event.stopPropagation();
				event.preventDefault();
				props.onhoverinstance(props.panelInfo.instanceId);
			}}

			onDragStart={(event)=>{
				event.stopPropagation();
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
				const direction = (ud.y == 'u' ? 'before' : 'after');
				// if( ud.y == 'u' ){
				// 	$this.addClass('broccoli__panel--drag-entered-u');
				// 	$this.removeClass('broccoli__panel--drag-entered-d');
				// }else{
				// 	$this.addClass('broccoli__panel--drag-entered-d');
				// 	$this.removeClass('broccoli__panel--drag-entered-u');
				// }

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
				const direction = (ud.y == 'u' ? 'before' : 'after');

				const moveFromInstance = globalState.selectedInstance;
				const moveToInstance = props.panelInfo.instanceId;
				props.onmoveinstance(moveFromInstance, moveToInstance, direction);
			}}
			onDragEnd={(event)=>{}}

			draggable="true"
		>
			{globalState.hoveredInstanceDirection && globalState.hoveredInstance && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId &&
				<div className={`kaleflower-layout-view__panel__drop-to-insert-here`}></div>
			}
			<div className={`kaleflower-layout-view__panel__create-new-element-before`}>
				<button type={`button`} className={`px2-btn`} onClick={async (event) => {
					event.preventDefault();
					event.stopPropagation();
					props.oncreatenewinstance(props.panelInfo.instanceId, 'before');
				}}>before</button>
			</div>
			<div className={`kaleflower-layout-view__panel__create-new-element-after`}>
				<button type={`button`} className={`px2-btn`} onClick={async (event) => {
					event.preventDefault();
					event.stopPropagation();
					props.oncreatenewinstance(props.panelInfo.instanceId, 'after');
				}}>after</button>
			</div>
		</div>
	);
});

export default Panel;

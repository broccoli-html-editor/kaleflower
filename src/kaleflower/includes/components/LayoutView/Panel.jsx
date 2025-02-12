import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';

const Panel = React.memo((props) => {
	const globalState = useContext(MainContext);
	const panelRef = useRef(null);
	const $ = globalState.jQuery;

	useEffect(async () => {
		return () => {
		};
	}, [globalState]);

	return (
		<div
			className={`kaleflower-layout-view__panel`
				+ `${globalState.selectedInstance && globalState.selectedInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view__panel--selected' : ''}`
				+ `${globalState.hoveredInstance && globalState.hoveredInstance.kaleflowerInstanceId == props.panelInfo.instanceId ? ' kaleflower-layout-view__panel--hovered' : ''}`
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
				props.ondragover(props.panelInfo.instanceId);
			}}
			onDragLeave={(event)=>{}}
			onDrop={(event)=>{
				event.preventDefault();
				event.stopPropagation();
				let transferData = event.dataTransfer.getData("text/json");
				try {
					transferData = JSON.parse(transferData);
				} catch (e) {}

				const moveFromInstance = globalState.selectedInstance;
				const moveToInstance = props.panelInfo.instanceId;
				props.onmoveinstance(moveFromInstance, moveToInstance);
			}}
			onDragEnd={(event)=>{}}

			draggable="true"
		>
		</div>
	);
});

export default Panel;

import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Builder} from '../../utils/Builder.js';
import {PreviewController} from './LayoutView_files/PreviewController.js';
let lastSelectedInstance = null;
let lastHoveredInstance = null;

const previewController = new PreviewController();

const LayoutView = React.memo((props) => {
	const globalState = useContext(MainContext);
	const $ = globalState.jQuery;

	const [localState, setLocalState] = useState({
		scrollTop: 0,
		lastPreviewHtml: '{}',
		instancePositions: {},
	});

	previewController.on('selectInstance', (event) => {
		props.onselectinstance(event.instanceId);
	});
	previewController.on('hoverInstance', (event) => {
		props.onhoverinstance(event.instanceId);
	});
	previewController.on('adjustPanelsPosition', (event) => {
		const newLocalState = {
			...localState,
			scrollTop: event.scrollTop,
		};
		setLocalState(newLocalState);
	});

	useEffect(async () => {
		const builder = new Builder(globalState.utils);
		const dist = builder.build(globalState);
		const jsonDist = JSON.stringify(dist);

		const iframeElement = $('iframe.kaleflower-layout-view__iframe').get(0); // TODO: 閉じる

		if( localState.lastPreviewHtml != jsonDist ){
			await previewController.refresh(globalState, iframeElement, dist);
			const newLocalState = {
				...localState,
				lastPreviewHtml: jsonDist,
			};
			setLocalState(newLocalState);
		}

		if( globalState.selectedInstance || globalState.hoveredInstance ){
			let instances = [];
			if( globalState.selectedInstance && lastSelectedInstance != globalState.selectedInstance.kaleflowerInstanceId ){
				instances.push(globalState.selectedInstance.kaleflowerInstanceId);
				lastSelectedInstance = globalState.selectedInstance.kaleflowerInstanceId;
			}
			if( globalState.hoveredInstance && lastHoveredInstance != globalState.hoveredInstance.kaleflowerInstanceId ){
				instances.push(globalState.hoveredInstance.kaleflowerInstanceId);
				lastHoveredInstance = globalState.hoveredInstance.kaleflowerInstanceId;
			}
			if( instances.length ){
				previewController.sendMessageToIframe('getInstancePositions', {
					instances: instances,
				}, (res) => {
					const newLocalState = {
						...localState,
					};
					newLocalState.instancePositions = {
						...localState.instancePositions,
						...res,
					};
					setLocalState(newLocalState);
				});
			}
		}

		return () => {
		};
	}, [globalState]);

	return (
		<div className="kaleflower-layout-view">
			<iframe className="kaleflower-layout-view__iframe" src={globalState.options.urlLayoutViewPage || "about:blank"} />
			<div className="kaleflower-layout-view__panels">
				<div className="kaleflower-layout-view__panels">
					{ globalState.selectedInstance &&
						<div className="kaleflower-layout-view__panels-selected"
							style={(()=>{
								const positions = localState.instancePositions[globalState.selectedInstance.kaleflowerInstanceId] || {};
								return {
									top: (positions.offsetTop || 0) - (localState.scrollTop || 0),
									left: (positions.offsetLeft || 0),
									width: (positions.width || 0),
									height: (positions.height || 0),
								};
							})()}></div>
					}
					{ globalState.hoveredInstance &&
						<div className="kaleflower-layout-view__panels-hovered"
							style={(()=>{
								const positions = localState.instancePositions[globalState.hoveredInstance.kaleflowerInstanceId] || {};
								return {
									top: (positions.offsetTop || 0) - (localState.scrollTop || 0),
									left: (positions.offsetLeft || 0),
									width: (positions.width || 0),
									height: (positions.height || 0),
								};
							})()}></div>
					}
				</div>
			</div>
		</div>
	);
});

export default LayoutView;

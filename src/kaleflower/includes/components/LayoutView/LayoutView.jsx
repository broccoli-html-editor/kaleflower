import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Builder} from '../../utils/Builder.js';
import {PreviewController} from './LayoutView_files/PreviewController.js';

const previewController = new PreviewController();

const LayoutView = React.memo((props) => {
	const globalState = useContext(MainContext);
	const panelsContainerRef = useRef(null);
	const $ = globalState.jQuery;

	const [localState, setLocalState] = useState({
		panels: [],
		lastPreviewHtml: '{}',
		instancePositions: {},
	});

	previewController.on('adjustPanelsPosition', (event) => {
		const $panelsContainer = $(panelsContainerRef.current);
		$panelsContainer.scrollTop(event.scrollTop);
		const newLocalState = {
			...localState,
			panels: event.panels,
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

		const $panelsContainer = $(panelsContainerRef.current);
		$panelsContainer.on('scroll', (event) => {
			previewController.sendMessageToIframe('scrollTo', {
				scrollTop: $panelsContainer.scrollTop(),
			});
		});

		return () => {
			$panelsContainer.off('scroll');
		};
	}, [globalState]);

	return (
		<div className="kaleflower-layout-view">
			<iframe className="kaleflower-layout-view__iframe" src={globalState.options.urlLayoutViewPage || "about:blank"} />
			<div className="kaleflower-layout-view__panels"
				ref={panelsContainerRef}>
				<div className="kaleflower-layout-view__panels-inner">
					{localState.panels.map((panel, index) => {
						const nextPanel = localState.panels[index+1];
						return (
							<div key={index}
								className={`kaleflower-layout-view__panel`
									+ `${globalState.selectedInstance && globalState.selectedInstance.kaleflowerInstanceId == panel.instanceId ? ' kaleflower-layout-view__panel--selected' : ''}`
									+ `${globalState.hoveredInstance && globalState.hoveredInstance.kaleflowerInstanceId == panel.instanceId ? ' kaleflower-layout-view__panel--hovered' : ''}`
									}
								data-kaleflower-instance-id={panel.instanceId}
								style={{
									top: panel.offsetTop,
									left: panel.offsetLeft,
									width: ((panel)=>{
										if( !nextPanel ){
											return panel.width;
										}
										const distance = nextPanel.offsetLeft - (panel.offsetLeft + panel.width);
										if( distance <= 0 ){
											return panel.width;
										}
										return panel.width + distance;
									})(panel),
									height: ((panel)=>{
										if( !nextPanel ){
											return panel.height;
										}
										const distance = nextPanel.offsetTop - (panel.offsetTop + panel.height);
										if( distance <= 0 ){
											return panel.height;
										}
										return panel.height + distance;
									})(panel),
								}}
								onClick={(event) => {
									event.stopPropagation();
									event.preventDefault();
									props.onselectinstance(panel.instanceId);
								}}
								onMouseOver={(event) => {
									event.stopPropagation();
									event.preventDefault();
									props.onhoverinstance(panel.instanceId);
								}}

								onDragStart={(event)=>{
									event.stopPropagation();
									const sendData = {
										kaleflowerInstanceId: panel.instanceId,
									};
									event.dataTransfer.setData("text/json", JSON.stringify(sendData) );
									const onselectinstance = props.onselectinstance || function(){};
									onselectinstance(panel.instanceId);
								}}
								onDragEnter={(event)=>{}}
								onDragOver={(event)=>{
									event.preventDefault();
									event.stopPropagation();
									props.ondragover(panel.instanceId);
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
									const moveToInstance = panel.instanceId;
									props.onmoveinstance(moveFromInstance, moveToInstance);
								}}
								onDragEnd={(event)=>{}}

								draggable="true"
							>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
});

export default LayoutView;

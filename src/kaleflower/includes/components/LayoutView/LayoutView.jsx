import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Builder} from '../../utils/Builder.js';
import Panel from './Panel.jsx';
import {PreviewController} from './LayoutView_files/PreviewController.js';

const previewController = new PreviewController();

const LayoutView = React.memo((props) => {
	const globalState = useContext(MainContext);
	const iframeRef = useRef(null);
	const panelsContainerRef = useRef(null);
	const $ = globalState.jQuery;

	const [localState, setLocalState] = useState({
		panels: [],
		lastPreviewHtml: '{}',
	});

	// iframeに適用するスタイルを生成
	const getIframeStyle = () => {
		if (props.viewportWidth === null) {
			return {};
		}
		return {
			width: `${props.viewportWidth}px`,
		};
	};

	previewController
		.on('adjustPanelsPosition', (event) => {
			const $panelsContainer = $(panelsContainerRef.current);
			$panelsContainer.scrollTop(event.scrollTop);
			props.onchangeviewportstatus({
				width: event.window.width,
				height: event.window.height,
			});
			setLocalState((prevState) => {
				prevState.panels = event.panels;
				return prevState;
			});
		});

	const currentLayer = (() => {
		if (globalState.selectedInstance) {
			for (let i = 0; i < localState.panels.length; i++) {
				const panel = localState.panels[i];
				if (panel.isLayer && panel.instanceId === globalState.selectedInstance.kaleflowerInstanceId) {
					return panel.instanceId;
				}
				if (panel.currentLayer && panel.instanceId === globalState.selectedInstance.kaleflowerInstanceId) {
					return panel.currentLayer;
				}
			}
		}
		return null;
	})();

	useEffect(async () => {
		const builder = new Builder(globalState.utils, globalState.lb);
		const dist = builder.build(globalState);
		const jsonDist = JSON.stringify(dist);

		if( localState.lastPreviewHtml != jsonDist ){
			await previewController.refresh(globalState, iframeRef.current, dist);
			const newLocalState = {
				...localState,
				lastPreviewHtml: jsonDist,
			};
			setLocalState(newLocalState);
		}

		// ビューポートサイズが変更された場合、iframeにメッセージを送信
		if (props.viewportWidth !== null) {
			previewController.sendMessageToIframe('setViewportWidth', {
				width: props.viewportWidth
			});
		} else {
			previewController.sendMessageToIframe('resetViewportWidth', {});
		}

		const $panelsContainer = $(panelsContainerRef.current);
		$panelsContainer.on('scroll.kaleflower', (event) => {
			previewController.sendMessageToIframe('scrollTo', {
				scrollTop: $panelsContainer.scrollTop(),
				scrollLeft: $panelsContainer.scrollLeft(),
			});
		});

		return () => {
			$panelsContainer.off('scroll.kaleflower');
		};
	}, [globalState, props.viewportWidth]);

	return (
		<div className="kaleflower-layout-view">
			<div className="kaleflower-layout-view__inner" style={getIframeStyle()}>
				<iframe
					ref={iframeRef}
					className="kaleflower-layout-view__iframe"
					src={globalState.options.urlLayoutViewPage || "about:blank"}
					/>
				<div className="kaleflower-layout-view__panels"
					ref={panelsContainerRef}>
					<div className="kaleflower-layout-view__panels-inner">
						{localState.panels.map((panel, index) => {

							let isAllowedPanel = false;
							if(currentLayer === panel.currentLayer){
								isAllowedPanel = true;
							}
							if(currentLayer === panel.parentLayer && panel.currentLayer === panel.instanceId){
								isAllowedPanel = true;
							}
							if(currentLayer === panel.instanceId){
								isAllowedPanel = true;
							}

							if(!isAllowedPanel){
								return;
							}
							return (
								<Panel key={index}
									panelInfo={panel}
									panelIndex={index}
									onselectinstance={props.onselectinstance}
									onhoverinstance={props.onhoverinstance}
									onmoveinstance={props.onmoveinstance}
									ondragover={props.ondragover}
									oncreatenewinstance={props.oncreatenewinstance} />
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
});

export default LayoutView;

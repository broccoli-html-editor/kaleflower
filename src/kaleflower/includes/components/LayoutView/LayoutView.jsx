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
		instancePositions: {},
	});

	previewController
		.on('adjustPanelsPosition', (event) => {
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

		if( localState.lastPreviewHtml != jsonDist ){
			await previewController.refresh(globalState, iframeRef.current, dist);
			const newLocalState = {
				...localState,
				lastPreviewHtml: jsonDist,
			};
			setLocalState(newLocalState);
		}

		const $panelsContainer = $(panelsContainerRef.current);
		$panelsContainer.on('scroll.kaleflower', (event) => {
			previewController.sendMessageToIframe('scrollTo', {
				scrollTop: $panelsContainer.scrollTop(),
			});
		});

		return () => {
			$panelsContainer.off('scroll.kaleflower');
		};
	}, [globalState]);

	return (
		<div className="kaleflower-layout-view">
			<iframe
				ref={iframeRef}
				className="kaleflower-layout-view__iframe"
				src={globalState.options.urlLayoutViewPage || "about:blank"}
				/>
			<div className="kaleflower-layout-view__panels"
				ref={panelsContainerRef}>
				<div className="kaleflower-layout-view__panels-inner">
					{localState.panels.map((panel, index) => {
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
	);
});

export default LayoutView;

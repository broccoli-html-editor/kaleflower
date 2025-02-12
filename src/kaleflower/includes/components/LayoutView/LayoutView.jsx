import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Builder} from '../../utils/Builder.js';
import Panel from './Panel.jsx';
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
						return (
							<Panel key={index}
								panelInfo={panel}
								panelIndex={index}
								onselectinstance={props.onselectinstance}
								onhoverinstance={props.onhoverinstance}
								onmoveinstance={props.onmoveinstance}
								ondragover={props.ondragover} />
						);
					})}
				</div>
			</div>
		</div>
	);
});

export default LayoutView;

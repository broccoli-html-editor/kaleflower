import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Builder} from '../../utils/Builder.js';
import {PreviewController} from './LayoutView_files/PreviewController.js';

const previewController = new PreviewController();

const LayoutView = React.memo((props) => {
	const globalState = useContext(MainContext);
	const $ = globalState.jQuery;

	previewController.on('selectInstance', (event) => {
		props.onselectinstance(event.instanceId);
	});

	useEffect(async () => {
		const builder = new Builder(globalState.utils);
		const dist = builder.build(globalState);

		const iframeElement = $('iframe.kaleflower-layout-view__iframe').get(0); // TODO: 閉じる

		await previewController.refresh(globalState, iframeElement, dist);

		return () => {
		};
	}, [globalState]);

	return (
		<div className="kaleflower-layout-view">
			<iframe className="kaleflower-layout-view__iframe" src={globalState.options.urlLayoutViewPage || "about:blank"} />
		</div>
	);
});

export default LayoutView;

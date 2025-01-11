import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Builder} from '../../utils/Builder.js';
import {PreviewController} from './LayoutView_files/PreviewController.js';

const LayoutView = React.memo((props) => {
	const globalState = useContext(MainContext);
	const $ = globalState.jQuery;

	useEffect(async () => {
		const builder = new Builder(globalState.utils);
		const dist = builder.build(globalState);
		const previewController = new PreviewController();

		const iframeElement = $('iframe.kaleflower-layout-view__iframe').get(0); // TODO: 閉じる

		await previewController.refresh(globalState, iframeElement, dist);

		return () => {
		};
	}, [globalState]);

	return (
		<div className="kaleflower-layout-view">
			<iframe className="kaleflower-layout-view__iframe" src="about:blank" />
		</div>
	);
});

export default LayoutView;

import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Builder} from '../../utils/Builder.js';

const LayoutView = React.memo((props) => {
	const globalState = useContext(MainContext);
	const $ = globalState.jQuery;

	useEffect(() => {
		const builder = new Builder(globalState.utils);
		const dist = builder.build(globalState);
		console.log('dist:', dist);

		const $iframe = $('iframe.kaleflower-layout-view__iframe');
		console.log('$iframe:', $iframe.get(0));
		$iframe.get(0).contentWindow.document.open();
		$iframe.get(0).contentWindow.document.write(dist.html.main);
		$iframe.get(0).contentWindow.document.close();


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

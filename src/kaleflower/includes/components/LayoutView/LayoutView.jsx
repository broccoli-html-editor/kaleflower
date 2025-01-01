import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Builder} from '../../utils/Builder.js';

const LayoutView = React.memo((props) => {
	const globalState = useContext(MainContext);

	const builder = new Builder(globalState.utils, globalState.configs, globalState.components, globalState.assets);
	Object.keys(globalState.contents).forEach((contentId) => {
		builder.build(globalState.contents[contentId]);
	});

	return (
		<div className="kaleflower-layout-view">
			<iframe className="kaleflower-layout-view__iframe" src="about:blank" />
		</div>
	);
});

export default LayoutView;

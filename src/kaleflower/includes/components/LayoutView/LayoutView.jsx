import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';

const LayoutView = React.memo((props) => {
	const globalState = useContext(MainContext);

	return (
		<div className="kaleflower-layout-view">
			LayoutView...
		</div>
	);
});

export default LayoutView;

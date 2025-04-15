import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';

const ViewPortSetting = React.memo((props) => {
	const globalState = useContext(MainContext);

	return (
		<div className="kaleflower-viewport-setting">
		</div>
	);
});

export default ViewPortSetting;

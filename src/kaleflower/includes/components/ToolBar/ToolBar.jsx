import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';
import ViewPortSetting from './ViewPortSetting.jsx';

const ToolBar = React.memo((props) => {
	const globalState = useContext(MainContext);

	return (
		<div className="kaleflower-toolbar">
            <ViewPortSetting />
		</div>
	);
});

export default ToolBar;

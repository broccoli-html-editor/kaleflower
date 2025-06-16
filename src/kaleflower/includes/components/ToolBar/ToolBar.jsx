import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';
import ViewPortSwitch from './ViewPortSwitch.jsx';
import SettingModal from './SettingModal.jsx';

const ToolBar = React.memo((props) => {
	const globalState = useContext(MainContext);

	return (
		<div className="kaleflower-toolbar">
			<div className="kaleflower-toolbar__inner">
				<SettingModal />
				<ViewPortSwitch />
			</div>
		</div>
	);
});

export default ToolBar;

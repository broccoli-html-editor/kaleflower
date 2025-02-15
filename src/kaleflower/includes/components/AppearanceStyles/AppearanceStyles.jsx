import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';
import Dark from './Dark.jsx';
import Light from './Light.jsx';
import Auto from './Auto.jsx';

const AppearanceStyles = (props) => {
	if(props.appearance == 'light'){
		return (
			<Light />
		);
	}
	if(props.appearance == 'dark'){
		return (
			<Dark />
		);
	}
	return (
		<Auto />
	);
};

export default AppearanceStyles;

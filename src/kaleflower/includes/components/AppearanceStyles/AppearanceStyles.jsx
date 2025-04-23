import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';
import Dark from './Dark.js';
import Light from './Light.js';
import {compileString} from 'sass';

const AppearanceStyles = (props) => {
	const globalState = useContext(MainContext);

	useEffect(() => {
		const $appearance = globalState.$('<style>');
		const stylesheet = (() => {
			if (props.appearance === 'dark') {
				return Dark();
			} else if (props.appearance === 'light') {
				return Light();
			} else {
				return `
@media (prefers-color-scheme: dark) {
${Dark()}
}
@media (prefers-color-scheme: light) {
${Light()}
}
`;
			}
		})();

		$appearance.html(stylesheet);

		globalState.$(document.head).append($appearance);

		return () => {
			$appearance.remove();
		};
	}, []);

	return (
		<></>
	);
};

export default AppearanceStyles;

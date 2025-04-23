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
			let stylesheet = ``;
			if (props.appearance === 'dark') {
				stylesheet = Dark();
			} else if (props.appearance === 'light') {
				stylesheet = Light();
			} else {
				stylesheet = `
@media (prefers-color-scheme: dark) {
${Dark()}
}
@media (prefers-color-scheme: light) {
${Light()}
}
`;
			}

			// Compile SCSS to CSS using sass
			try {
				const compiledCss = compileString(stylesheet).css;
				stylesheet = compiledCss;
			} catch (error) {
				console.error('SCSS compilation error:', error);
				// Fall back to original stylesheet if compilation fails
			}
			return stylesheet;
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

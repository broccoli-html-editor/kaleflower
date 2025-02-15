import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';

const Light = (props) => {
	const globalState = useContext(MainContext);

	useEffect(() => {
		const $appearance = globalState.$('<style>');
		$appearance.html(`
.kaleflower-insance-tree-view {
	background-color: #eee;
	color: #333;
}
`);

		globalState.$(document.head).append($appearance);

		return () => {
			$appearance.remove();
		};
	}, []);

	return (
		<></>
	);
};

export default Light;

import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';

const Dark = (props) => {
	const globalState = useContext(MainContext);

	useEffect(() => {
		const $appearance = globalState.$('<style>');
		$appearance.html(`
.kaleflower-insance-tree-view {
	background-color: #555;
	color: #ddd;
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

export default Dark;

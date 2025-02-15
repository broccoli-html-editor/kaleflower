import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';

const Auto = (props) => {
	const globalState = useContext(MainContext);

	useEffect(() => {
		const $appearance = globalState.$('<style>');
		$appearance.html(`
@media (prefers-color-scheme: dark) {
	.kaleflower-insance-tree-view {
		background-color: #555;
		color: #ddd;
	}
}
@media (prefers-color-scheme: light) {
	.kaleflower-insance-tree-view {
		background-color: #eee;
		color: #333;
	}
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

export default Auto;

import React from "react";
import ReactDOM from "react-dom";
import {Layout} from "./includes/Layout.jsx";

window.Kaleflower = class {
	#container;
	#options;

	/**
	 * Constructor
	 */
	constructor(container, options) {
		this.#container = container;
		this.#options = options;
	}

	/**
	 * Initialize
	 */
	init() {
		ReactDOM.render(<Layout />, this.#container);
		return;
	}
}

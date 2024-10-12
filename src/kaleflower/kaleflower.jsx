import React from "react";
import ReactDOM from "react-dom";
import {Layout} from "./includes/Layout.jsx";
import "./includes/styles/kaleflower.scss";

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
		this.#container.className = ["kaleflower", this.#container.className].join(' ');
		ReactDOM.render(<Layout />, this.#container);
		return;
	}
}

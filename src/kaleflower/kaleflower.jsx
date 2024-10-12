import React, { useContext, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Root from "./includes/Root.jsx";
import "./includes/styles/kaleflower.scss";
import $ from "jquery";

window.Kaleflower = class {
	#container;
	#options;
	#globalState = {};

	/**
	 * Constructor
	 */
	constructor(container, options) {
		this.#container = container;
		this.#options = options;

		this.#container.className = ["kaleflower", this.#container.className].join(' ');
		ReactDOM.render(
			<Root onChangeState={(newData)=>{
				this.#globalState = newData;
			}} />,
			this.#container
		);
	}

	/**
	 * Render the Root component
	 */
	#render() {
		window.dispatchEvent(new CustomEvent('kaleflower-state-updated', {detail: this.#globalState}));
	}

	/**
	 * Load Kaleflower file
	 */
	async load(realpath){
		return new Promise((rlv, rjt) => {
			$.ajax({
				url: realpath,
				success: (res) => {
					this.#globalState.xml = res;
					this.#render();
					rlv();
				},
				error: (res) => {
					console.error('Kaleflower: Failed to load a file.', res);
					rjt(res);
				},
			});
		});
	}

	/**
	 * Get Kaleflower Data
	 */
	get(){
		return this.#globalState;
	}
}

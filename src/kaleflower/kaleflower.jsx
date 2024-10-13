import React, { useContext, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Root from "./includes/Root.jsx";
import "./includes/styles/kaleflower.scss";
import {Utils} from "./includes/utils/Utils.js";
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
				success: async (res) => {
					await this.loadXml(res);
					rlv();
				},
				error: (res) => {
					console.error('Kaleflower: Failed to load a file.', realpath, res);
					rjt(res);
				},
			});
		});
	}

	/**
	 * Load Kaleflower file from XML
	 */
	async loadXml(xml){
		return new Promise(async (rlv, rjt) => {
			try {
				const utils = new Utils();
				const newGlobalState = await utils.XmlToState(xml);
				this.#globalState = {
					...this.#globalState,
					...newGlobalState,
				};
				this.#render();
				rlv();
			}catch(e){
				console.error('Kaleflower: Failed to parse XML.', e);
				rjt(e);
			}
		});
	}

	/**
	 * Get Kaleflower Data
	 */
	get(){
		const utils = new Utils();
		const xml = utils.StateToKflowXml(this.#globalState);
		return xml;
	}
}

import React, { useContext, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Root from "./includes/Root.jsx";
import "./includes/styles/kaleflower.scss";
import {KflowXml} from "./includes/utils/KflowXml.js";
import {Utils} from "./includes/utils/Utils.js";
import $ from "jquery";
import LangBank from 'langbank';
import {} from "../../vendor/pickles2/px2style/dist/px2style.js";
const languageCsv = require('../../data/language.csv');

window.Kaleflower = class {
	#kflowProcId;
	#utils;
	#container;
	#options;
	#lb;
	#globalState = {
		$: $,
		jQuery: $,
	};

	/**
	 * Constructor
	 */
	constructor(container, options) {
		this.#utils = new Utils();
		this.#container = container;
		this.#options = options;
		this.#options.lang = options.lang || 'en';
		this.#options.appearance = options.appearance || 'auto';

		this.#kflowProcId = this.#utils.createUUID();

		this.#container.className = ["kaleflower", `kaleflower--appearance-${this.#options.appearance}`, this.#container.className].join(' ');

		new Promise((resolve) => {
			this.#lb = new LangBank(languageCsv, () => {
				this.#lb.setLang( this.#options.lang );
				resolve();
			});

		}).then(() => {
			ReactDOM.render(
				<Root
					kflow-proc-id={this.#kflowProcId}
					options={this.#options}
					lb={this.#lb}
				/>,
				this.#container
			);
		});

	}

	/**
	 * Render the Root component
	 */
	#render() {
		window.dispatchEvent(new CustomEvent(`kaleflower-${this.#kflowProcId}-state-updated`, {detail: this.#globalState}));
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
				const kflowXml = new KflowXml(this.#utils);
				const newGlobalState = await kflowXml.XmlToState(xml);
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
		const kflowXml = new KflowXml(this.#utils);
		const xml = kflowXml.StateToKflowXml(this.#globalState);
		return xml;
	}
}

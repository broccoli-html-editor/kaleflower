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
	#eventCallbacks = {};

	/**
	 * Constructor
	 */
	constructor(container, options) {
		this.#utils = new Utils();
		this.#container = container;
		this.#options = options;
		this.#options.lang = options.lang || 'en';
		this.#options.appearance = options.appearance || 'auto';
		this.#options.extra = options.extra || {};
		this.#options.finalize = options.finalize || (contents => contents);
		this.#eventCallbacks = {};

		this.#kflowProcId = this.#utils.createUUID();

		this.#container.className = [
			"kaleflower",
			`kaleflower--appearance-${this.#options.appearance}`,
			this.#container.className
		].join(' ');

		new Promise((resolve) => {
			this.#lb = new LangBank(languageCsv, () => {
				this.#lb.setLang( this.#options.lang );
				resolve();
			});

		}).then(() => {
			ReactDOM.render(
				<Root
					kaleflower={this}
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
		window.dispatchEvent(
			new CustomEvent(
				`kaleflower-${this.#kflowProcId}-state-updated`,
				{
					detail: this.#globalState,
				}
			)
		);
	}

	/**
	 * Load Kaleflower file
	 */
	async load(realpath){
		return new Promise((rlv, rjt) => {
			$.ajax({
				url: realpath,
				success: async (res) => {
					setTimeout(() => {
						this.loadXml(res);
						rlv();
					}, 10);
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

	/**
	 * Register an event handler
	 * @param {string} eventName - Name of the event
	 * @param {Function} callback - Event handler function
	 * @returns {window.Kaleflower} - Returns this instance for method chaining
	 */
	on(eventName, callback){
		if (typeof eventName !== 'string' || typeof callback !== 'function') {
			return this;
		}
		
		if (!this.#eventCallbacks[eventName]) {
			this.#eventCallbacks[eventName] = [];
		}
		
		this.#eventCallbacks[eventName].push(callback);
		return this;
	}

	/**
	 * Remove an event handler
	 * @param {string} eventName - Name of the event
	 * @returns {window.Kaleflower} - Returns this instance for method chaining
	 */
	off(eventName){
		if (typeof eventName !== 'string') {
			return this;
		}

		if (!this.#eventCallbacks[eventName]) {
			return this;
		}

		// Remove specific handler
		this.#eventCallbacks[eventName] = [];
		return this;
	}

	/**
	 * Trigger an event
	 * @param {string} eventName - Name of the event to trigger
	 * @param {any} [data] - Optional data to pass to event handlers
	 * @returns {window.Kaleflower} - Returns this instance for method chaining
	 */
	trigger(eventName, data){
		if (typeof eventName !== 'string' || !this.#eventCallbacks[eventName]) {
			return this;
		}

		const event = {
			"data": data || {},
		};

		this.#eventCallbacks[eventName].forEach(callback => {
			try {
				callback(event);
			} catch(e) {
				console.error(`Error executing event handler for "${eventName}":`, e);
			}
		});
		
		return this;
	}
}

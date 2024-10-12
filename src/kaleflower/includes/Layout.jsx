import React from "react";
import ReactDOM from "react-dom";
import iterate79 from 'iterate79';
import LangBank from 'langbank';

const languageCsv = require('../../../data/language.csv');

export class Layout extends React.Component {
	#options;

	/**
	 * Constructor
	 */
	constructor(options) {
		super();
		this.#options = options;
	}

	/**
	 * Renderer
	 */
	render() {
		return (
			<div className="kaleflower__frame">kaleflower</div>
		);
	}
}

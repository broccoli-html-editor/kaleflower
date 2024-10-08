import React from "react";
import ReactDOM from "react-dom";
import iterate79 from 'iterate79';
import LangBank from 'langbank';

const languageCsv = require('../../data/language.csv');

class Layout extends React.Component {

	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Renderer
	 */
	render() {

		return (
			<div>kaleflower</div>
		);
	}
}

const app = document.getElementById('cont-app');
ReactDOM.render(<Layout/>, app);

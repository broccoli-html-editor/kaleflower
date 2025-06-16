import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Utils} from "../../utils/Utils.js";
const utils = new Utils();
import jQuery from "jquery";
const $ = jQuery;

const SettingModal = React.memo((props) => {
	const globalState = useContext(MainContext);
	const btnRef = useRef(null);
	let modal;

	const onClick = (event) => {
		const $body = $(utils.bindTwig(
			require('-!text-loader!./SettingModal_files/templates/modal.twig'),
			{}
		));
		modal = px2style.modal({
			"title": 'Settings',
			"body": $body,
			"buttons": [
				$('<button class="px2-btn px2-btn--primary">')
					.text('OK'),
			],
			"buttonsSecondary": [
				$('<button class="px2-btn">')
					.text('Cancel')
					.on('click', function(){
						modal.close();
					}),
			],
			"form": {
				"submit": function(event){
					modal.close();
				},
			},
		});
	};

	return (
		<div className="kaleflower-setting-modal">
			<button
				ref={btnRef}
				type="button"
				onClick={onClick}
				className="px2-btn kaleflower-setting-modal__button"
				>Settings</button>
		</div>
	);
});

export default SettingModal;

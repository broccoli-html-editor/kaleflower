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
			{
				moduleName: globalState.configs['module-name'],
				moduleNamePrefix: globalState.configs['module-name-prefix'],
				breakPoints: globalState.configs['break-points'],
				colorPalettes: globalState.configs['color-palettes'],
			}
		));
		const formObj = px2style.form($body);

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
					const errors = {};
					const moduleName = $body.find('[name=module-name]').val();
					if(moduleName.match(/[^0-9a-zA-Z\-\_]/)){
						errors['module-name'] = 'Invalid charactor included.';
					}
					const moduleNamePrefix = $body.find('[name=module-name-prefix]').val();
					if(moduleNamePrefix.match(/[^0-9a-zA-Z\-\_]/)){
						errors['module-name-prefix'] = 'Invalid charactor included.';
					}
					if( Object.keys(errors).length ){
						formObj.reportValidationError({
							errors: errors,
						});
						return;
					}

					globalState.setGlobalState((prevState) => {

						prevState.configs['module-name'] = $body.find('[name=module-name]').val();
						prevState.configs['module-name-prefix'] = $body.find('[name=module-name-prefix]').val();

						// TODO: break-points の編集機能を追加する
						// TODO: color-palettes の編集機能を追加する

						return prevState;
					});
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

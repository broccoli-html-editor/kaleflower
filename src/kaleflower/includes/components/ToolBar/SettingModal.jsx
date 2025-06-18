import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';
import { BreakPointsEditor } from "./SettingModal_files/BreakPointsEditor.js";
import { ColorPalettesEditor } from "./SettingModal_files/ColorPalettesEditor.js";
import { Utils } from "../../utils/Utils.js";
const utils = new Utils();
import jQuery from "jquery";
const $ = jQuery;

const SettingModal = React.memo((props) => {
	const globalState = useContext(MainContext);
	const btnRef = useRef(null);
	let modal;

	/**
	 * 設定モーダルを開く
	 * @param {*} event 
	 */
	const onClickOpenSettingModalButton = (event) => {
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

		const breakPointsEditor = new BreakPointsEditor({
			$body: $body,
			globalState: globalState,
			utils: utils,
		});

		const colorPalettesEditor = new ColorPalettesEditor({
			$body: $body,
			globalState: globalState,
			utils: utils,
		});

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
					.on('click', function () {
						modal.close();
					}),
			],
			"form": {
				"submit": function (event) {
					const errors = {};
					const moduleName = $body.find('[name=module-name]').val();
					if (moduleName.match(/[^0-9a-zA-Z\-\_]/)) {
						errors['module-name'] = 'Invalid charactor included.';
					}
					const moduleNamePrefix = $body.find('[name=module-name-prefix]').val();
					if (moduleNamePrefix.match(/[^0-9a-zA-Z\-\_]/)) {
						errors['module-name-prefix'] = 'Invalid charactor included.';
					}

					// ブレイクポイントデータのバリデーション
					const breakPointsResult = breakPointsEditor.get();
					if (breakPointsResult.hasErrors) {
						// ブレイクポイントにエラーがある場合は送信を停止
						return;
					}

					// カラーパレットデータのバリデーション
					const colorPalettesResult = colorPalettesEditor.get();
					if (colorPalettesResult.hasErrors) {
						// カラーパレットにエラーがある場合は送信を停止
						return;
					}

					if (Object.keys(errors).length) {
						formObj.reportValidationError({
							errors: errors,
						});
						return;
					}

					globalState.setGlobalState((prevState) => {

						prevState.configs['module-name'] = $body.find('[name=module-name]').val();
						prevState.configs['module-name-prefix'] = $body.find('[name=module-name-prefix]').val();

						// break-points の編集機能
						prevState.configs['break-points'] = breakPointsResult.breakPoints;

						// TODO: color-palettes の編集機能を追加する
						// color-palettes の編集機能
						prevState.configs['color-palettes'] = colorPalettesResult.colorPalettes;

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
				onClick={onClickOpenSettingModalButton}
				className="px2-btn kaleflower-setting-modal__button"
			>Settings</button>
		</div>
	);
});

export default SettingModal;

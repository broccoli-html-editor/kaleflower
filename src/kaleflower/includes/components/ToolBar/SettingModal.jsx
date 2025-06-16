import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';
import { Utils } from "../../utils/Utils.js";
const utils = new Utils();
import jQuery from "jquery";
const $ = jQuery;

const SettingModal = React.memo((props) => {
	const globalState = useContext(MainContext);
	const btnRef = useRef(null);
	let modal;

	// ブレイクポイントの管理用関数
	const sortBreakPointsByMaxWidth = (breakPoints) => {
		const entries = Object.entries(breakPoints || {});
		return entries.sort((a, b) => {
			const maxWidthA = parseInt(a[1]['max-width']) || 0;
			const maxWidthB = parseInt(b[1]['max-width']) || 0;
			return maxWidthB - maxWidthA; // 降順（大きい順）
		});
	};

	const createBreakPointItem = (id, data, index) => {
		return `
<div class="kaleflower-setting-modal__breakpoints-editor__item" data-index="${index}">
	<div class="kaleflower-setting-modal__breakpoints-editor__item-row">
		<div class="kaleflower-setting-modal__breakpoints-editor__item-field kaleflower-setting-modal__breakpoints-editor__item-field--id">
			<label class="kaleflower-setting-modal__breakpoints-editor__item-label">ID</label>
			<input type="text" class="px2-input kaleflower-setting-modal__breakpoints-editor__item-input" data-field="id" value="${id}" placeholder="e.g. lg" />
		</div>
		<div class="kaleflower-setting-modal__breakpoints-editor__item-field kaleflower-setting-modal__breakpoints-editor__item-field--name">
			<label class="kaleflower-setting-modal__breakpoints-editor__item-label">Name</label>
			<input type="text" class="px2-input kaleflower-setting-modal__breakpoints-editor__item-input" data-field="name" value="${data.name || ''}" placeholder="e.g. Large" />
		</div>
		<div class="kaleflower-setting-modal__breakpoints-editor__item-field kaleflower-setting-modal__breakpoints-editor__item-field--max-width">
			<label class="kaleflower-setting-modal__breakpoints-editor__item-label">Max Width</label>
			<input type="number" class="px2-input kaleflower-setting-modal__breakpoints-editor__item-input" data-field="max-width" value="${data['max-width'] || ''}" placeholder="1400" />
		</div>
		<div class="kaleflower-setting-modal__breakpoints-editor__item-actions">
			<button type="button" class="kaleflower-setting-modal__breakpoints-editor__remove-btn" data-action="remove">Remove</button>
		</div>
	</div>
</div>
`;
	};

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

		// ブレイクポイント編集機能の初期化
		const $breakpointsItems = $body.find('#breakpoints-items');
		const $addBtn = $body.find('#add-breakpoint-btn');

		// 初期データの表示
		const renderBreakPoints = () => {
			const sortedBreakPoints = sortBreakPointsByMaxWidth(globalState.configs['break-points']);
			$breakpointsItems.html('');
			sortedBreakPoints.forEach(([id, data], index) => {
				$breakpointsItems.append(createBreakPointItem(id, data, index));
			});
		};

		// 新しいブレイクポイントを追加
		const addBreakPoint = () => {
			const newIndex = $breakpointsItems.find('.kaleflower-setting-modal__breakpoints-editor__item').length;
			const newId = `bp${newIndex + 1}`;
			const newData = { name: '', 'max-width': '' };
			$breakpointsItems.append(createBreakPointItem(newId, newData, newIndex));
		};

		// ブレイクポイントを削除
		const removeBreakPoint = (index) => {
			$breakpointsItems.find(`[data-index="${index}"]`).remove();
		};

		// ブレイクポイントデータを収集
		const collectBreakPointsData = () => {
			const breakPoints = {};
			let hasAnyError = false;

			$breakpointsItems.find('.kaleflower-setting-modal__breakpoints-editor__item').each(function () {
				const $item = $(this);
				const id = $item.find('[data-field="id"]').val().trim();
				const name = $item.find('[data-field="name"]').val().trim();
				const maxWidth = $item.find('[data-field="max-width"]').val().trim();

				// エラーメッセージをクリア
				$item.find('.kaleflower-setting-modal__breakpoints-editor__error').remove();

				// バリデーション
				let hasError = false;

				if (!id) {
					$item.find('[data-field="id"]').after('<div class="kaleflower-setting-modal__breakpoints-editor__error">ID is required</div>');
					hasError = true;
				} else if (id.match(/[^0-9a-zA-Z\-\_]/)) {
					$item.find('[data-field="id"]').after('<div class="kaleflower-setting-modal__breakpoints-editor__error">Invalid character in ID</div>');
					hasError = true;
				} else if (breakPoints[id]) {
					$item.find('[data-field="id"]').after('<div class="kaleflower-setting-modal__breakpoints-editor__error">Duplicate ID</div>');
					hasError = true;
				}

				if (!name) {
					$item.find('[data-field="name"]').after('<div class="kaleflower-setting-modal__breakpoints-editor__error">Name is required</div>');
					hasError = true;
				}

				if (!maxWidth) {
					$item.find('[data-field="max-width"]').after('<div class="kaleflower-setting-modal__breakpoints-editor__error">Max width is required</div>');
					hasError = true;
				} else if (isNaN(parseInt(maxWidth)) || parseInt(maxWidth) <= 0) {
					$item.find('[data-field="max-width"]').after('<div class="kaleflower-setting-modal__breakpoints-editor__error">Invalid max width</div>');
					hasError = true;
				}

				if (hasError) {
					hasAnyError = true;
				} else {
					breakPoints[id] = {
						name: name,
						'max-width': maxWidth
					};
				}
			});

			return { breakPoints, hasErrors: hasAnyError };
		};

		// イベントリスナーの設定
		$addBtn.on('click', addBreakPoint);
		$breakpointsItems.on('click', '[data-action="remove"]', function () {
			const index = $(this).closest('.kaleflower-setting-modal__breakpoints-editor__item').data('index');
			removeBreakPoint(index);
		});

		// 初期表示
		renderBreakPoints();

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
					const breakPointsResult = collectBreakPointsData();
					if (breakPointsResult.hasErrors) {
						// ブレイクポイントにエラーがある場合は送信を停止
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

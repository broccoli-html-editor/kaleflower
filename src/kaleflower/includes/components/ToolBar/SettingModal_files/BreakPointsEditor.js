import jQuery from "jquery";
const $ = jQuery;

/**
 * BreakPointsEditor
 */
export class BreakPointsEditor {
	#$body;
	#globalState;
	#utils;
	#$breakpointsItems;
	#$addBtn;

	constructor(params) {
		const _this = this;
		this.#$body = params.$body;
		this.#globalState = params.globalState;
		this.#utils = params.utils;

		// ブレイクポイント編集機能の初期化
		this.#$breakpointsItems = this.#$body.find('#kaleflower-breakpoints-items-container');
		this.#$addBtn = this.#$body.find('#kaleflower-add-breakpoint-btn');

		// イベントリスナーの設定
		this.#$addBtn.on('click', () => { return this.#addBreakPoint();});
		this.#$breakpointsItems.on('click', '[data-action="remove"]', function () {
			const index = $(this).closest('.kaleflower-setting-modal__breakpoints-editor__item').data('index');
			_this.#removeBreakPoint(index);
		});

		// 初期表示
		this.#init();
	}

	/**
	 * 初期表示
	 */
	#init () {
		const sortedBreakPoints = this.#sortBreakPointsByMaxWidth(this.#globalState.configs['break-points']);
		this.#$breakpointsItems.html('');
		sortedBreakPoints.forEach(([id, data], index) => {
			this.#$breakpointsItems.append(this.#createBreakPointItem(id, data, index));
		});
	};


	/**
	 * ブレイクポイントの管理用関数
	 */ 
	#sortBreakPointsByMaxWidth (breakPoints) {
		const entries = Object.entries(breakPoints || {});
		return entries.sort((a, b) => {
			const maxWidthA = parseInt(a[1]['max-width']) || 0;
			const maxWidthB = parseInt(b[1]['max-width']) || 0;
			return maxWidthB - maxWidthA; // 降順（大きい順）
		});
	};

	#createBreakPointItem (id, data, index) {
		return this.#utils.bindTwig(
			require('-!text-loader!./templates/breakPointItem.twig'),
			{
				id: id,
				data: data,
				index: index,
			}
		);
	};


	/**
	 * 新しいブレイクポイントを追加
	 */
	#addBreakPoint () {
		const newIndex = this.#$breakpointsItems.find('.kaleflower-setting-modal__breakpoints-editor__item').length;
		const newId = `bp${newIndex + 1}`;
		const newData = { name: '', 'max-width': '' };
		this.#$breakpointsItems.append(this.#createBreakPointItem(newId, newData, newIndex));
	};

	/**
	 * ブレイクポイントを削除
	 */
	#removeBreakPoint (index) {
		this.#$breakpointsItems.find(`[data-index="${index}"]`).remove();
	};

	/**
	 * ブレイクポイントデータを取得
	 */
	get () {
		const breakPoints = {};
		let hasAnyError = false;

		this.#$breakpointsItems.find('.kaleflower-setting-modal__breakpoints-editor__item').each(function () {
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

};

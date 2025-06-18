import jQuery from "jquery";
const $ = jQuery;

/**
 * ColorPalettesEditor
 */
export class ColorPalettesEditor {
	#$body;
	#globalState;
	#utils;
	#$colorPalettesItems;
	#$addBtn;

	constructor(params) {
		const _this = this;
		this.#$body = params.$body;
		this.#globalState = params.globalState;
		this.#utils = params.utils;

		// カラーパレット編集機能の初期化
		this.#$colorPalettesItems = this.#$body.find('#kaleflower-color-palettes-items-container');
		this.#$addBtn = this.#$body.find('#kaleflower-add-color-palette-btn');

		// イベントリスナーの設定
		this.#$addBtn.on('click', () => { return this.#addColorPalette(); });
		this.#$colorPalettesItems.on('click', '[data-action="remove"]', function () {
			const index = $(this).closest('.kaleflower-setting-modal__color-palettes-editor__item').data('index');
			_this.#removeColorPalette(index);
		});

		// 初期表示
		this.#init();
	}

	/**
	 * 初期表示
	 */
	#init() {
		const sortedColorPalettes = this.#sortColorPalettesByName(this.#globalState.configs['color-palettes']);
		this.#$colorPalettesItems.html('');
		sortedColorPalettes.forEach(([id, data], index) => {
			this.#$colorPalettesItems.append(this.#createColorPaletteItem(id, data, index));
		});
	};

	/**
	 * カラーパレットの管理用関数
	 */
	#sortColorPalettesByName(colorPalettes) {
		const entries = Object.entries(colorPalettes || {});
		return entries.sort((a, b) => {
			const nameA = (a[1].name || '').toLowerCase();
			const nameB = (b[1].name || '').toLowerCase();
			return nameA.localeCompare(nameB); // 昇順（名前順）
		});
	};

	/**
	 * カラーパレットアイテムのテンプレートを生成
	 * @param {string} id - カラーパレットのID
	 * @param {Object} data - カラーパレットのデータ（name, color）
	 * @param {number} index - アイテムのインデックス
	 */
	#createColorPaletteItem(id, data, index) {
		return this.#utils.bindTwig(
			require('-!text-loader!./templates/colorPaletteItem.twig'),
			{
				id: id,
				data: data,
				index: index,
			}
		);
	};

	/**
	 * 新しいカラーパレットを追加
	 */
	#addColorPalette() {
		const newIndex = this.#$colorPalettesItems.find('.kaleflower-setting-modal__color-palettes-editor__item').length;
		const newId = `color${newIndex + 1}`;
		const newData = { name: '', color: '' };
		this.#$colorPalettesItems.append(this.#createColorPaletteItem(newId, newData, newIndex));
	};

	/**
	 * カラーパレットを削除
	 */
	#removeColorPalette(index) {
		this.#$colorPalettesItems.find(`[data-index="${index}"]`).remove();
	};

	/**
	 * カラーパレットデータを取得
	 */
	get() {
		const colorPalettes = {};
		let hasAnyError = false;

		this.#$colorPalettesItems.find('.kaleflower-setting-modal__color-palettes-editor__item').each(function () {
			const $item = $(this);
			const id = $item.find('[data-field="id"]').val().trim();
			const name = $item.find('[data-field="name"]').val().trim();
			const color = $item.find('[data-field="color"]').val().trim();

			// エラーメッセージをクリア
			$item.find('.kaleflower-setting-modal__color-palettes-editor__error').remove();

			// バリデーション
			let hasError = false;

			if (!id) {
				$item.find('[data-field="id"]').after('<div class="kaleflower-setting-modal__color-palettes-editor__error">ID is required</div>');
				hasError = true;
			} else if (id.match(/[^0-9a-zA-Z\-\_]/)) {
				$item.find('[data-field="id"]').after('<div class="kaleflower-setting-modal__color-palettes-editor__error">Invalid character in ID</div>');
				hasError = true;
			} else if (colorPalettes[id]) {
				$item.find('[data-field="id"]').after('<div class="kaleflower-setting-modal__color-palettes-editor__error">Duplicate ID</div>');
				hasError = true;
			}

			if (!name) {
				$item.find('[data-field="name"]').after('<div class="kaleflower-setting-modal__color-palettes-editor__error">Name is required</div>');
				hasError = true;
			}

			if (!color) {
				$item.find('[data-field="color"]').after('<div class="kaleflower-setting-modal__color-palettes-editor__error">Color code is required</div>');
				hasError = true;
			} else if (!color.match(/^#[0-9a-fA-F]{3,6}$/)) {
				$item.find('[data-field="color"]').after('<div class="kaleflower-setting-modal__color-palettes-editor__error">Invalid color code (e.g. #ffffff)</div>');
				hasError = true;
			}

			if (hasError) {
				hasAnyError = true;
			} else {
				colorPalettes[id] = {
					name: name,
					color: color
				};
			}
		});

		return { colorPalettes, hasErrors: hasAnyError };
	};

};

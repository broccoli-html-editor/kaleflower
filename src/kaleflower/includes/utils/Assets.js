import utils79 from 'utils79';

export class Assets {

	/** Utility */
	#utils;
	#events = {};

	#assets;

	/**
	 * Constructor
	 */
	constructor(utils) {
		this.#utils = utils;

		this.#assets = {};
	}


	/**
	 * イベントハンドラを登録する
	 * @param {*} eventName 
	 * @param {*} callback 
	 * @returns 
	 */
	on (eventName, callback) {
		this.#events[eventName] = callback;
		return;
	}

	/**
	 * イベントを発火する
	 * @param {*} eventName 
	 * @param {*} data 
	 * @returns 
	 */
	trigger (eventName, data) {
		if(!this.#events[eventName]){ return; }
		this.#events[eventName]({
			...data,
			type: eventName,
		});
		return;
	}

	addNewAsset(){
		const assetId = crypto.randomUUID();
		const extension = 'txt';
		const bin = '';
		const assetInfo = {
			"id": assetId,
			'ext': extension,
			'size': bin.length,
			'width': 0,
			'height': 0,
			'base64': utils79.base64_encode(bin),
			// 'md5': utils79.md5(bin),
			'isPrivateMaterial': false,
			'publicFilename': `${assetId}.${extension}`,
			'field': '', // <= フィールド名 (ex: image, multitext)
			'fieldNote': '', // <= フィールドが記録する欄
		};

		this.#assets[assetId] = assetInfo;
		this.trigger("create", {
			"assetId": assetId,
			"assetInfo": assetInfo,
		});
		return this.#assets[assetId].id;
	}

	updateAsset(assetId, dataUri, originalFileName, options){
		if(!this.#assets[assetId]){
			return false;
		}
		const extension = originalFileName.replace( new RegExp('^.*\\.'), '' );
		const base64 = dataUri.replace( new RegExp('^data:image/[^;]+;base64,'), '' );
		const bin = utils79.base64_decode(base64);
		const assetInfo = {
			"id": assetId,
			'ext': extension,
			'size': bin.length,
			'width': parseInt(options.width) || 0,
			'height': parseInt(options.height) || 0,
			'base64': base64,
			// 'md5': utils79.md5(bin),
			'isPrivateMaterial': (options.isPrivateMaterial !== undefined ? options.isPrivateMaterial : false),
			'publicFilename': (options.publicFilename !== undefined ? options.publicFilename : `${assetId}.${extension}`),
			'field': (options.field !== undefined ? options.field : ''), // <= フィールド名 (ex: image, multitext)
			'fieldNote': (options.fieldNote !== undefined ? options.fieldNote : ''), // <= フィールドが記録する欄
		};

		this.#assets[assetId] = assetInfo;
		this.trigger("update", {
			"assetId": assetId,
			"assetInfo": assetInfo,
		});
		return this.#assets[assetId];
	}

	restoreAsset(asset){
		const $parsed_asset = this.#parseAsset(asset);
		const assetId = $parsed_asset.id;
		this.#assets[assetId] = $parsed_asset;
		return this.#assets[assetId];
	}

	#parseAsset(asset){
		const assetId = asset.getAttribute('id');
		const assetInfo = {
			"id": assetId,
			'ext': asset.getAttribute('ext'),
			'size': parseInt(asset.getAttribute('size')),
			'width': parseInt(asset.getAttribute('width')),
			'height': parseInt(asset.getAttribute('height')),
			'base64': asset.getAttribute('base64'),
			'md5': asset.getAttribute('md5'),
			'isPrivateMaterial': (asset.getAttribute('is-private-material') === 'true' ? true : asset.getAttribute('is-private-material') === 'false' ? false : null),
			'publicFilename': asset.getAttribute('public-filename'),
			'field': asset.getAttribute('field'), // <= フィールド名 (ex: image, multitext)
			'fieldNote': asset.getAttribute('field-note'), // <= フィールドが記録する欄
		};

		return assetInfo;
	}

	getAssets(){
		return this.#assets;
	}

	getAsset(assetId){
		return this.#assets[assetId] || null;
	}
};

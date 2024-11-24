import utils79 from 'utils79';

export class Assets {

	/** Utility */
	#utils;

	#assets;

	/**
	 * Constructor
	 */
	constructor(utils) {
		this.#utils = utils;

		this.#assets = {};
	}

	addNewAsset(){
		const assetId = crypto.randomUUID();
		const extension = 'txt';
		const bin = '';
		const assetInfo = {
			"id": assetId,
			'ext': extension,
			'size': bin.length,
			'base64': utils79.base64_encode(bin),
			// 'md5': utils79.md5(bin),
			'isPrivateMaterial': false,
			'publicFilename': `${assetId}.${extension}`,
			'field': '', // <= フィールド名 (ex: image, multitext)
			'fieldNote': '', // <= フィールドが記録する欄
		};

		this.#assets[assetId] = assetInfo;
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
			'base64': base64,
			// 'md5': utils79.md5(bin),
			'isPrivateMaterial': (options.isPrivateMaterial !== undefined ? options.isPrivateMaterial : false),
			'publicFilename': (options.publicFilename !== undefined ? options.publicFilename : `${assetId}.${extension}`),
			'field': (options.field !== undefined ? options.field : ''), // <= フィールド名 (ex: image, multitext)
			'fieldNote': (options.fieldNote !== undefined ? options.fieldNote : ''), // <= フィールドが記録する欄\
		};

		this.#assets[assetId] = assetInfo;
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
			'size': asset.getAttribute('size'),
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

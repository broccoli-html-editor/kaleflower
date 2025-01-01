import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Utils} from "../../utils/Utils.js";
import {Builder} from '../../utils/Builder.js';

const LayoutView = React.memo((props) => {
	const globalState = useContext(MainContext);
	const utils = new Utils();

	// アセット (フィールドテンプレートに渡される用)
	let $allAssets = {};
	const assets = globalState.assets.getAssets();
	Object.keys(assets).forEach(($assetId) => {
		const $asset = assets[$assetId];
		$allAssets[$assetId] = {
			'id': $assetId,
			'ext': $asset.ext,
			'size': Number($asset.size),
			'isPrivateMaterial': utils.toBoolean($asset.isPrivateMaterial),
			'path': 'data:image/' + $asset.ext+';base64,' + $asset.base64,
			'base64': $asset.base64,
			'field': $asset.field,
			'fieldNote': $asset.fieldNote,
		};
	});

	const builder = new Builder(globalState.utils, globalState.configs, globalState.components, $allAssets);
	Object.keys(globalState.contents).forEach((contentId) => {
		builder.build(globalState.contents[contentId]);
	});

	return (
		<div className="kaleflower-layout-view">
			<iframe className="kaleflower-layout-view__iframe" src="about:blank" />
		</div>
	);
});

export default LayoutView;

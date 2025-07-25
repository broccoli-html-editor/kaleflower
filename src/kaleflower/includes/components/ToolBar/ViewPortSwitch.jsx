import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';

const ViewPortSwitch = React.memo((props) => {
	const globalState = useContext(MainContext);

	// ブレイクポイントのサイズ配列を取得
	const getBreakPointSizes = () => {
		if (!globalState.configs || !globalState.configs['break-points']) {
			return [];
		}

		// 最大サイズを取得して100px大きいサイズも追加
		const breakPoints = globalState.configs['break-points'];
		const sizes = [];
		let maxSize = 0;

		// breakPointsがオブジェクトの場合は配列に変換する
		const breakPointsArray = Array.isArray(breakPoints) 
			? breakPoints 
			: Object.keys(breakPoints).map(key => breakPoints[key]);

		breakPointsArray.forEach(bp => {
			const size = parseInt(bp['max-width'], 10);
			sizes.push({
				name: bp.name,
				width: size,
			});
			if (size > maxSize) {
				maxSize = size;
			}
		});

		// 最大サイズよりも100px大きいサイズを追加
		const minimumMaxSize = 390; // 最小の最大サイズ
		maxSize = maxSize + 100;
		if(maxSize < minimumMaxSize){
			maxSize = minimumMaxSize;
		}
		sizes.push({
			name: 'max',
			width: maxSize,
		});

		// サイズの小さい順にソート
		return sizes.sort((a, b) => a.width - b.width);
	};

	// ビューポートサイズ変更ハンドラ
	const handleViewportSizeChange = (size) => {
		globalState.setGlobalState((prevState) => {
			// 同じサイズが選択された場合は、成り行き幅にリセット
			const newSize = prevState.selectedViewportSize === size ? null : size;

			return {
				...prevState,
				selectedViewportSize: newSize,
			};
		});
	};

	const breakPointSizes = getBreakPointSizes();

	return (
		<div className="kaleflower-viewport-switch">
			<span className="kaleflower-viewport-switch__tools-label">Viewport:</span>
			<ul className="kaleflower-viewport-switch__list">
				{breakPointSizes.map((size) => (
					<li key={size.name}>
						<button 
							className={`px2-btn px2-btn--sm ${globalState.selectedViewportSize === size.width ? 'px2-btn--primary' : ''}`}
							onClick={() => handleViewportSizeChange(size.width)}
						>
							{size.name} ({size.width}px)
						</button>
					</li>
				))}
			</ul>
		</div>
	);
});

export default ViewPortSwitch;

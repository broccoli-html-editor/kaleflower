import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext.js';

const ViewPortSetting = React.memo((props) => {
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
				width: size
			});
			if (size > maxSize) {
				maxSize = size;
			}
		});
		
		// 最大サイズよりも100px大きいサイズを追加
		sizes.push({
			name: 'xl',
			width: maxSize + 100
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
				selectedViewportSize: newSize
			};
		});
	};

	// ビューポートサイズボタンをレンダリング
	const renderViewportSizeButtons = () => {
		const breakPointSizes = getBreakPointSizes();
		
		return (
			<div className="kaleflower__header-viewport-tools">
				<span className="kaleflower__header-viewport-tools-label">ビューポート:</span>
				{breakPointSizes.map((size) => (
					<button 
						key={size.name}
						className={`kaleflower__header-viewport-button ${globalState.selectedViewportSize === size.width ? 'kaleflower__header-viewport-button--active' : ''}`}
						onClick={() => handleViewportSizeChange(size.width)}
					>
						{size.name} ({size.width}px)
					</button>
				))}
				<button 
					className={`kaleflower__header-viewport-button ${globalState.selectedViewportSize === null ? 'kaleflower__header-viewport-button--active' : ''}`}
					onClick={() => handleViewportSizeChange(null)}
				>
					成り行き幅
				</button>
			</div>
		);
	};

	return (
		<div className="kaleflower-viewport-setting">
			{renderViewportSizeButtons()}
		</div>
	);
});

export default ViewPortSetting;

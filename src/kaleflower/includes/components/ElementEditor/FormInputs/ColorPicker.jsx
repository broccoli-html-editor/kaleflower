import React, { useState, useEffect, useRef } from 'react';
import { Color } from '../../../utils/Color.js';
import { CssParser } from '../../../utils/CssParser.js';

const ColorPicker = (props) => {
	const inputRef = useRef(null);
	const attrName = (!props.hasCssClassName && props.breakPointName ? `${props.attrName}--${props.breakPointName}` : props.attrName);
	const cssPropName = props.cssPropName || null;
	const color = new Color();
	const cssParser = new CssParser();
	cssParser.set(props.instance, props.hasCssClassName, props.breakPointName);

	const defaultValue = cssParser.getProperty(cssPropName);

	// colorPalettesをname順で並べ替えた配列に変換
	const paletteList = Object.entries(props.colorPalettes || {})
		.map(([id, item]) => ({ id, ...item }))
		.sort((a, b) => a.name.localeCompare(b.name));

	// kf-color-palette("xxx")形式か判定
	const paletteMatch = defaultValue && defaultValue.match(/^kf-color-palette\("(.+?)"\)$/);
	const [selectedPaletteId, setSelectedPaletteId] = useState(
		paletteMatch ? paletteMatch[1] : (defaultValue && !paletteMatch ? 'custom' : '')
	);
	const [customColor, setCustomColor] = useState(paletteMatch ? '' : (defaultValue || ''));

	useEffect(() => {
		// defaultValueが変わったらstateも更新
		const paletteMatch = defaultValue && defaultValue.match(/^kf-color-palette\("(.+?)"\)$/);
		setSelectedPaletteId(paletteMatch ? paletteMatch[1] : (defaultValue && !paletteMatch ? 'custom' : ''));
		setCustomColor(paletteMatch ? '' : (defaultValue || ''));
	}, [defaultValue]);

	// select変更時
	const handlePaletteChange = (e) => {
		const paletteId = e.target.value;
		setSelectedPaletteId(paletteId);
		if (paletteId === 'custom') {
			// カスタムカラー選択時は値を変更しない
			return;
		}
		setCustomColor('');
		const newValue = `kf-color-palette("${paletteId}")`;

		if(props.computedKey){
			props.instance[props.computedKey] = newValue;
		}
		if( !cssPropName ) {
			props.instance.setAttribute(attrName, newValue);
			if (!newValue.trim().length) {
				props.instance.removeAttribute(attrName);
			}
		}else{
			cssParser.setProperty(cssPropName, newValue);
			cssParser.save();
		}
		const onchange = props.onchange() || function(){};
		onchange(props.instance);
	};

	// テキスト入力変更時
	const handleCustomColorChange = (e) => {
		const value = e.target.value;
		setCustomColor(value);
		setSelectedPaletteId('custom');
		if(props.computedKey){
			props.instance[props.computedKey] = value;
		}
		if( !cssPropName ) {
			props.instance.setAttribute(attrName, value);
			if (!value.trim().length) {
				props.instance.removeAttribute(attrName);
			}
		}else{
			cssParser.setProperty(cssPropName, value);
			cssParser.save();
		}
		const onchange = props.onchange() || function(){};
		onchange(props.instance);
	};

	return (
		<div className="kaleflower-element-editor__property">
			<div className="kaleflower-element-editor__property-key">
				{props.attrName || props.cssPropName}:
			</div>
			<div className="kaleflower-element-editor__property-val">
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					{/* パレット選択UI */}
					<label style={{ marginBottom: '5px' }}>Select Color:</label>
					<select
						className="px2-input px2-input--block"
						value={selectedPaletteId}
						onChange={handlePaletteChange}
						style={{ marginBottom: '10px' }}
					>
						<option value=""></option>
						{paletteList.map(item => (
							<option key={item.id} value={item.id}>
								{item.name}（{item.color}）
							</option>
						))}
						<option value="custom">Custom Color</option>
					</select>
					{/* Custom Color選択時のみテキスト入力 */}
					{selectedPaletteId === 'custom' && (
						<>
							<label style={{ marginBottom: '5px' }}>Custom Color Code:</label>
							<input
								type="text"
								className="px2-input px2-input--block"
								style={{ flexGrow: 1, marginRight: '5px' }}
								value={customColor}
								onChange={handleCustomColorChange}
								placeholder=""
							/>
						</>
					)}
				</div>
				<div style={{ marginTop: '10px' }}>
					Preview: <span style={{
						backgroundColor: paletteMatch
							? (props.colorPalettes[paletteMatch[1]]?.color || 'transparent')
							: (selectedPaletteId === 'custom' ? (customColor || 'transparent') : 'transparent'),
						padding: '2px 8px',
						color: '#000',
						borderRadius: '3px'
					}}>
						{paletteMatch
							? `${props.colorPalettes[paletteMatch[1]]?.name || paletteMatch[1]}（${props.colorPalettes[paletteMatch[1]]?.color || ''}）`
							: (selectedPaletteId === 'custom' ? (customColor || 'transparent') : '')}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ColorPicker;

import React, { useState, useEffect } from 'react';
import { CssParser } from '../../../utils/CssParser.js';

const ColorPicker = (props) => {
	const cssPropName = props.cssPropName || null;
	const cssParser = new CssParser();
	cssParser.set(props.instance, props.hasCssClassName, props.breakPointName);

	const defaultValue = cssParser.getProperty(cssPropName);

	const [h, setH] = useState(0);
	const [s, setS] = useState(0);
	const [l, setL] = useState(0);

	useEffect(() => {
		if (defaultValue) {
			// Convert hex to HSL
			const hex = defaultValue.substring(1);
			const r = parseInt(hex.substring(0, 0 + 2), 16) / 255;
			const g = parseInt(hex.substring(2, 4), 16) / 255;
			const b = parseInt(hex.substring(4, 6), 16) / 255;

			const rgb = { r, g, b };

			const hsl = {
				h: Math.floor(rgbToHsl(rgb)),
				s: Math.floor((1 - Math.max(Math.min(rgb.r, rgb.g, rgb.b), Math.min(rgb.r, rgb.g, rgb.b))) * 100),
				l: Math.floor((Math.max(rgb.r, rgb.g, rgb.b) + Math.min(rgb.r, rgb.g, rgb.b)) / 2 * 100),
			};

			setH(hsl.h);
			setS(hsl.s);
			setL(hsl.l);
		}
	}, [defaultValue]);

	const rgbToHsl = (rgb) => {
		let h = 0;
		let max = Math.max(rgb.r, rgb.g, rgb.b);
		let min = Math.min(rgb.r, rgb.g, rgb.b);
		let delta = max - min;

		if (delta === 0) {
			h = 0;
		} else if (rgb.r === max) {
			h = (rgb.g - rgb.b) / delta;
		} else if (rgb.g === max) {
			h = 2 + (rgb.b - rgb.r) / delta;
		} else {
			h = 4 + (rgb.r - rgb.g) / delta;
		}

		h *= 60;
		if (h < 0) {
			h += 360;
		}

		return h;
	};

	const rgbToHex = (r, g, b) => {
		const hex = (r << 16) | (g << 8) | b;
		return '#' + (0x10000 + hex).toString(16).slice(-6);
	};

	const handleChangeH = (e) => {
		setH(parseInt(e.target.value));
		triggerOnChange();
	};

	const handleChangeS = (e) => {
		setS(parseInt(e.target.value));
		triggerOnChange();
	};

	const handleChangeL = (e) => {
		setL(parseInt(e.target.value));
		triggerOnChange();
	};

	const triggerOnChange = () => {
		const newValue = rgbToHex(Math.floor((h/360)*255), Math.floor((s/100)*255), Math.floor((l/100)*255));
		cssParser.setProperty(cssPropName, newValue).save();
		props.onchange();
	}

	return (
		<div className="kaleflower-element-editor__property">
			<div className="kaleflower-element-editor__property-key">
				{props.attrName || props.cssPropName}:
			</div>
			<div className="kaleflower-element-editor__property-val">
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div style={{ display: 'flex' }}>
						<label>H:</label>
						<input type="range" min="0" max="360" value={h} onChange={handleChangeH} style={{ width: '100px', marginLeft: '10px' }} />
					</div>
					<div style={{ display: 'flex' }}>
						<label>S:</label>
						<input type="range" min="0" max="100" value={s} onChange={handleChangeS} style={{ width: '100px', marginLeft: '10px' }} />
					</div>
					<div style={{ display: 'flex' }}>
						<label>L:</label>
						<input type="range" min="0" max="100" value={l} onChange={handleChangeL} style={{ width: '100px', marginLeft: '10px' }} />
					</div>
				</div>
				<div style={{ marginTop: '10px' }}>
					Current Color: <span style={{ backgroundColor: 'black', color: 'white' }}>{defaultValue}</span>
				</div>
			</div>
		</div>
	);
};

export default ColorPicker;

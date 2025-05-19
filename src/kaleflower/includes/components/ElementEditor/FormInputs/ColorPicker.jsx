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

	const hslToRgb = (h, s, l) => {
		// HSLをRGBに変換する関数
		s /= 100;
		l /= 100;
		
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = l - c / 2;
		
		let r, g, b;
		
		if (h >= 0 && h < 60) {
			[r, g, b] = [c, x, 0];
		} else if (h >= 60 && h < 120) {
			[r, g, b] = [x, c, 0];
		} else if (h >= 120 && h < 180) {
			[r, g, b] = [0, c, x];
		} else if (h >= 180 && h < 240) {
			[r, g, b] = [0, x, c];
		} else if (h >= 240 && h < 300) {
			[r, g, b] = [x, 0, c];
		} else {
			[r, g, b] = [c, 0, x];
		}
		
		return {
			r: Math.round((r + m) * 255),
			g: Math.round((g + m) * 255),
			b: Math.round((b + m) * 255)
		};
	};

	const triggerOnChange = () => {
		const rgb = hslToRgb(h, s, l);
		const newValue = rgbToHex(rgb.r, rgb.g, rgb.b);
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
					Current color: <span style={{ 
						backgroundColor: rgbToHex(hslToRgb(h, s, l).r, hslToRgb(h, s, l).g, hslToRgb(h, s, l).b), 
						padding: '2px 8px',
						color: l > 50 ? '#000' : '#fff',
						borderRadius: '3px'
					}}>
						{rgbToHex(hslToRgb(h, s, l).r, hslToRgb(h, s, l).g, hslToRgb(h, s, l).b)}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ColorPicker;

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

	const [hsb, setHsb] = useState({
		h: 0,
		s: 0,
		b: 0,
	});

	useEffect(() => {
		if (defaultValue) {
			inputRef.current.value = defaultValue;

			const hsb = color.hex2hsb(defaultValue);
			setHsb((prevState) => hsb);
		}
	}, [defaultValue]);


	const handleChangeH = (e) => {
		const newH = parseInt(e.target.value);
		const newValue = color.hsb2hex(newH, hsb.s, hsb.b);
		inputRef.current.value = newValue;
		setHsb((prevState) => ({
			...prevState,
			h: newH,
		}));
		updateValue();
	};

	const handleChangeS = (e) => {
		const newS = parseInt(e.target.value);
		const newValue = color.hsb2hex(hsb.h, newS, hsb.b);
		inputRef.current.value = newValue;
		setHsb((prevState) => ({
			...prevState,
			s: newS,
		}));
		updateValue();
	};

	const handleChangeB = (e) => {
		const newB = parseInt(e.target.value);
		const newValue = color.hsb2hex(hsb.h, hsb.s, newB);
		inputRef.current.value = newValue;
		setHsb((prevState) => ({
			...prevState,
			b: newB,
		}));
		updateValue();
	};

	// Update the attribute value
	const updateValue = () => {
		const newValue = inputRef.current.value;
		
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
			const newStyleSheet = cssParser.save();
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
					<div style={{ display: 'flex' }}>
						<label>H:</label>
						<input type="range" min="0" max="359" value={hsb.h} onChange={handleChangeH} style={{ width: '100px', marginLeft: '10px' }} />
					</div>
					<div style={{ display: 'flex' }}>
						<label>S:</label>
						<input type="range" min="0" max="100" value={hsb.s} onChange={handleChangeS} style={{ width: '100px', marginLeft: '10px' }} />
					</div>
					<div style={{ display: 'flex' }}>
						<label>B:</label>
						<input type="range" min="0" max="100" value={hsb.b} onChange={handleChangeB} style={{ width: '100px', marginLeft: '10px' }} />
					</div>
				</div>
				<div style={{ marginTop: '10px' }}>
					Current color: <span style={{ 
						backgroundColor: defaultValue || 'transparent', 
						padding: '2px 8px',
						color: hsb.b > 50 ? '#000' : '#fff',
						borderRadius: '3px'
					}}>
						{defaultValue || 'transparent'}
					</span>
				</div>
				<div style={{ marginTop: '10px' }}>
					<input
						ref={inputRef}
						type="text"
						className="px2-input"
						style={{ flexGrow: 1, marginRight: '5px' }}
						value={defaultValue || ''}
						onInput={(event) => {
							updateValue();
						}}
					/>

				</div>
			</div>
		</div>
	);
};

export default ColorPicker;

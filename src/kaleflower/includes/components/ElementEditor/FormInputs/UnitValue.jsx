import React, { useContext, useState, useEffect } from "react";
import { CssParser } from '../../../utils/CssParser.js';

const UnitValue = (props) => {
	const attrName = (!props.hasCssClassName && props.breakPointName ? `${props.attrName}--${props.breakPointName}` : props.attrName);
	const cssPropName = props.cssPropName || null;
	const cssParser = new CssParser();
	cssParser.set(props.instance, props.hasCssClassName, props.breakPointName);

	const units = ["px", "%", "vw", "vh", "em", "rem", "ex", "rex"];
	const keywords = ["auto", "fit-content", "min-content", "max-content", "fill", "fit", "stretch", "contain", "cover", "none"];

	const [numValue, setNumValue] = useState("");
	const [unitValue, setUnitValue] = useState("px");
	const [isKeyword, setIsKeyword] = useState(false);

	// Parse the current value into number and unit parts
	useEffect(() => {
		const currentValue = (cssPropName
			? cssParser.getProperty(cssPropName) || ''
			: (typeof(props.instance.getAttribute(attrName)) === 'string' ? props.instance.getAttribute(attrName) : ''));

		if (keywords.includes(currentValue)) {
			setIsKeyword(true);
			setUnitValue(currentValue);
			setNumValue("");
		} else {
			// Extract number and unit using regex
			const match = currentValue.match(/^([-+]?[0-9]*\.?[0-9]+)([a-z%]*)$/i);
			if (match) {
				setNumValue(match[1]);
				setUnitValue(match[2] || "px");
				setIsKeyword(false);
			} else {
				setNumValue("");
				setUnitValue("px");
				setIsKeyword(false);
			}
		}
	}, [props.instance.getAttribute(attrName), cssParser.save()]);

	// Update the attribute value
	const updateValue = (num, unit, isKeywordValue) => {
		const newValue = (() => {
			if (num === "" && units.includes(unit) && !keywords.includes(unit)) {
				// 空の値や単位のみの値をチェックし、必要に応じて空白に変換
				return "";
			}

			return (isKeywordValue ? unit : `${num}${unit}`);
		})();

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
				<div style={{ display: 'flex' }}>
					{!isKeyword && (
						<input
							type="text"
							className="px2-input"
							style={{ flexGrow: 1, marginRight: '5px' }}
							value={numValue}
							onInput={(event) => {
								const newNum = event.target.value;
								setNumValue(newNum);
								updateValue(newNum, unitValue, false);
							}}
						/>
					)}
					<select
						className="px2-input"
						value={unitValue}
						onChange={(event) => {
							const newUnit = event.target.value;
							const newIsKeyword = keywords.includes(newUnit);
							setUnitValue(newUnit);
							setIsKeyword(newIsKeyword);
							updateValue(numValue, newUnit, newIsKeyword);
						}}
					>
						<optgroup label="Units">
							{units.map(unit => (
								<option key={unit} value={unit}>{unit}</option>
							))}
						</optgroup>
						<optgroup label="Keywords">
							{keywords.map(keyword => (
								<option key={keyword} value={keyword}>{keyword}</option>
							))}
						</optgroup>
					</select>
				</div>
			</div>
		</div>
	);
};

export default UnitValue;

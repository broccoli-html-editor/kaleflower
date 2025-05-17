import React, { useContext, useState, useEffect } from "react";
import { CssParser } from '../../../utils/CssParser.js';

const Select = (props) => {
	const attrName = (!props.hasCssClassName && props.breakPointName ? `${props.attrName}--${props.breakPointName}` : props.attrName);

	const cssPropName = props.cssPropName || null;
	const cssParser = new CssParser();
	cssParser.set(props.instance, props.hasCssClassName, props.breakPointName);

	const currentValue = (cssPropName
		? cssParser.getProperty(cssPropName) || ''
		: (typeof(props.instance.getAttribute(attrName)) === 'string' ? props.instance.getAttribute(attrName) : ''));

	return (
		<div className="kaleflower-element-editor__property">
			<div className="kaleflower-element-editor__property-key">
				{props.attrName || props.cssPropName}:
			</div>
			<div className="kaleflower-element-editor__property-val">
				<select
					className={`px2-input px2-input--block`}
					value={currentValue}
					onChange={(event) => {
						const newValue = event.target.value;

						if(props.computedKey){
							props.instance[props.computedKey] = newValue;
						}

						if( !cssPropName ) {
							props.instance.setAttribute(attrName, newValue);
							if (!newValue.length) {
								props.instance.removeAttribute(attrName);
							}
						}else{
							cssParser.setProperty(cssPropName, newValue);
							const newStyleSheet = cssParser.save();
						}

						const onchange = props.onchange() || function(){};
						onchange(props.instance);
					}}
				>
					{Array.isArray(props.options) && props.options.map((option, index) => {
						// Handle both string options and {value, label} objects
						if (typeof option === 'object' && option !== null) {
							return (
								<option key={index} value={option.value}>
									{option.label || option.value}
								</option>
							);
						} else {
							return (
								<option key={index} value={option}>
									{option}
								</option>
							);
						}
					})}
				</select>
			</div>
		</div>
	);
};

export default Select;

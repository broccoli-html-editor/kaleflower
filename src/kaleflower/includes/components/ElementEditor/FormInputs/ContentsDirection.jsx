import React, { useContext, useState, useEffect } from "react";
import { CssParser } from '../../../utils/CssParser.js';

const ContentsDirection = (props) => {
	const cssParser = new CssParser();
	cssParser.set(props.instance, props.hasCssClassName, props.breakPointName);

	const currentValue = (() => {
		const display = cssParser.getProperty('display');
		const flexDirection = cssParser.getProperty('flex-direction');
		if( display == 'flex' ){
			if( flexDirection == 'row' ){
				return 'horizontal';
			}
			if( flexDirection == 'column' ){
				return 'vertical';
			}
		}
		return '';
	})();

	return (
		<div className="kaleflower-element-editor__property">
			<div className="kaleflower-element-editor__property-key">
				contents direction:
			</div>
			<div className="kaleflower-element-editor__property-val">
				<select
					className={`px2-input px2-input--block`}
					value={currentValue}
					onChange={(event) => {
						const newValue = event.target.value;

						if (newValue === "horizontal") {
							cssParser.setProperty('display', 'flex');
							cssParser.setProperty('flex-direction', 'row');
						}else if (newValue === "vertical") {
							cssParser.setProperty('display', 'flex');
							cssParser.setProperty('flex-direction', 'column');
						}else{
							cssParser.setProperty('display', null);
							cssParser.setProperty('flex-direction', null);
						}
						cssParser.save();

						const onchange = props.onchange() || function(){};
						onchange(props.instance);
					}}
				>
					<option value=""></option>
					<option value="horizontal">Horizontal</option>
					<option value="vertical">Vertical</option>
				</select>
			</div>
		</div>
	);
};

export default ContentsDirection;

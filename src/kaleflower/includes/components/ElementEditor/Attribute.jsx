import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext.js';
import {Utils} from "../../utils/Utils.js";

const Attribute = (props) => {
	const globalState = useContext(MainContext);
	const utils = new Utils();
	const attrName = (!props.hasCssClassName && props.breakPointName ? `${props.attrName}--${props.breakPointName}` : props.attrName);

	return (
		<div className="kaleflower-element-editor__property">
			<div className="kaleflower-element-editor__property-key">
				{props.attrName}:
			</div>
			<div className="kaleflower-element-editor__property-val">
				<input
					type={`text`}
					className={`px2-input`}
					value={typeof(props.instance.getAttribute(attrName)) == typeof('string') ? props.instance.getAttribute(attrName) : ''}
					onInput={(event)=>{
						const newValue = event.target.value;

						if(props.computedKey){
							props.instance[props.computedKey] = newValue;
						}

						props.instance.setAttribute(attrName, newValue);
						if( !newValue.length ){
							props.instance.removeAttribute(attrName);
						}

						const onchange = props.onchange() || function(){};
						onchange(props.instance);
					}} />
			</div>
		</div>
	);
};

export default Attribute;

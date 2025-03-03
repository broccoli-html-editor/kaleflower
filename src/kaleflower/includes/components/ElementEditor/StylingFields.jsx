import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Attribute from './Attribute.jsx';
import {Utils} from "../../utils/Utils.js";
const utils = new Utils();

const StylingFields = (props) => {
	const globalState = useContext(MainContext);

	function onchange(){
		const onchange = props.onchange || function(){};
		onchange(globalState.selectedInstance);
	}

	return (
		<>
			{((props.canBeLayer || props.canSetClass) ? <>
				<Attribute
					instance={props.targetElementNode}
					attrName="layer"
					onchange={onchange} />
				<Attribute
					instance={props.targetElementNode}
					attrName="layer-position-top"
					onchange={onchange} />
				<Attribute
					instance={props.targetElementNode}
					attrName="layer-position-right"
					onchange={onchange} />
				<Attribute
					instance={props.targetElementNode}
					attrName="layer-position-bottom"
					onchange={onchange} />
				<Attribute
					instance={props.targetElementNode}
					attrName="layer-position-left"
					onchange={onchange} />
			</> : <></>)}

			{((props.canSetContentsDirection || props.canSetClass) ? <Attribute
				instance={props.targetElementNode}
				attrName="contents-direction"
				onchange={onchange} /> : <></>)}

			{((props.canSetWidth || props.canSetClass) ? <Attribute
				instance={props.targetElementNode}
				attrName="width"
				computedKey="kaleflowerComputedWidth"
				onchange={onchange} /> : <></>)}

			{((props.canSetHeight || props.canSetClass) ? <Attribute
				instance={props.targetElementNode}
				attrName="height"
				computedKey="kaleflowerComputedHeight"
				onchange={onchange} /> : <></>)}

			{((props.canSetScrollable || props.canSetClass) ? <Attribute
				instance={props.targetElementNode}
				attrName="scrollable"
				onchange={onchange} /> : <></>)}

			{props.hasCssClassName &&
				<>
					<div className="kaleflower-element-editor__property">
						<div className="kaleflower-element-editor__property-key">
							custom style:
						</div>
						<div className="kaleflower-element-editor__property-val">
							<textarea
								className={`px2-input`}
								value={typeof(props.currentClassName) == typeof('string') ? props.targetElementNode.innerHTML : ''}
								onInput={(event)=>{
									const newStyleSheet = event.target.value;
									props.targetElementNode.innerHTML = newStyleSheet;

									onchange(globalState.selectedInstance);
								}} />
						</div>
					</div>
				</>}
		</>
	);
};

export default StylingFields;

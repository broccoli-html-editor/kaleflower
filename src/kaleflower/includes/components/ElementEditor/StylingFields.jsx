import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Attribute from './Attribute.jsx';
import {Utils} from "../../utils/Utils.js";
const utils = new Utils();

const StylingFields = (props) => {
	const globalState = useContext(MainContext);
	const breakPointName = (!props.hasCssClassName ? props.breakPointName : null);
		// NOTE: classNameがある場合、ブレイクポイントの編集対象の要素(props.targetElementNode)は media要素になるので、
		// breakPointName を意識する必要がない。
		// 通常の要素を編集する場合は、同じ要素に接尾辞 `--${props.breakPointName}` を付けた属性に値を保存するので、
		// この値を使ってブレイクポイントの値を取得する必要があるので、 `<Attribute />` に引き回す。

	function onchange(){
		const onchange = props.onchange || function(){};
		onchange(globalState.selectedInstance);
	}

	return (
		<>
			{((props.canBeLayer || props.canSetClass) ? <>
				<Attribute
					instance={props.targetElementNode}
					attrName={"layer"}
					breakPointName={breakPointName}
					onchange={onchange} />
				<Attribute
					instance={props.targetElementNode}
					attrName={"layer-position-top"}
					breakPointName={breakPointName}
					onchange={onchange} />
				<Attribute
					instance={props.targetElementNode}
					attrName={"layer-position-right"}
					breakPointName={breakPointName}
					onchange={onchange} />
				<Attribute
					instance={props.targetElementNode}
					attrName={"layer-position-bottom"}
					breakPointName={breakPointName}
					onchange={onchange} />
				<Attribute
					instance={props.targetElementNode}
					attrName={"layer-position-left"}
					breakPointName={breakPointName}
					onchange={onchange} />
			</> : <></>)}

			{((props.canSetContentsDirection || props.canSetClass) ? <Attribute
				instance={props.targetElementNode}
				attrName={"contents-direction"}
				breakPointName={breakPointName}
				onchange={onchange} /> : <></>)}

			{((props.canSetWidth || props.canSetClass) ? <Attribute
				instance={props.targetElementNode}
				attrName={"width"}
				computedKey="kaleflowerComputedWidth"
				breakPointName={breakPointName}
				onchange={onchange} /> : <></>)}

			{((props.canSetHeight || props.canSetClass) ? <Attribute
				instance={props.targetElementNode}
				attrName={"height"}
				computedKey="kaleflowerComputedHeight"
				breakPointName={breakPointName}
				onchange={onchange} /> : <></>)}

			{((props.canSetScrollable || props.canSetClass) ? <Attribute
				instance={props.targetElementNode}
				attrName={"scrollable"}
				breakPointName={breakPointName}
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

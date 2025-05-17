import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Text from './FormInputs/Text.jsx';
import Select from './FormInputs/Select.jsx';
import TextArea from './FormInputs/TextArea.jsx';
import UnitValue from './FormInputs/UnitValue.jsx';

const StylingFields = (props) => {
	const globalState = useContext(MainContext);
	const breakPointName = (!props.hasCssClassName ? props.breakPointName : null);
		// NOTE: classNameがある場合、ブレイクポイントの編集対象の要素(props.targetElementNode)は media要素になるので、
		// breakPointName を意識する必要がない。
		// 通常の要素を編集する場合は、同じ要素に接尾辞 `--${props.breakPointName}` を付けた属性に値を保存するので、
		// この値を使ってブレイクポイントの値を取得する必要があるので、 `<Text />` に引き回す。

	function onchange(){
		const onchange = props.onchange || function(){};
		onchange(globalState.selectedInstance);
	}

	return (
		<>
			<div className={`kaleflower-styling-fields ${!props.isActive ? 'kaleflower-styling-fields--is-inactive' : ''}`}>
				{((props.canBeLayer || props.canSetClass) ? <>
					<Select
						instance={props.targetElementNode}
						cssPropName={"position"}
						breakPointName={breakPointName}
						options={[
							{
								label: "Absolute",
								value: "absolute",
							},
							{
								label: "Relative",
								value: "relative",
							},
							{
								label: "Fixed",
								value: "fixed",
							},
							{
								label: "Sticky",
								value: "sticky",
							},
							{
								label: "Normal",
								value: "",
							},
						]}
						onchange={onchange} />
					<UnitValue
						instance={props.targetElementNode}
						cssPropName={"top"}
						breakPointName={breakPointName}
						onchange={onchange} />
					<UnitValue
						instance={props.targetElementNode}
						cssPropName={"right"}
						breakPointName={breakPointName}
						onchange={onchange} />
					<UnitValue
						instance={props.targetElementNode}
						cssPropName={"bottom"}
						breakPointName={breakPointName}
						onchange={onchange} />
					<UnitValue
						instance={props.targetElementNode}
						cssPropName={"left"}
						breakPointName={breakPointName}
						onchange={onchange} />
				</> : <></>)}

				{((props.canSetContentsDirection || props.canSetClass) ? <Select
					instance={props.targetElementNode}
					attrName={"contents-direction"}
					breakPointName={breakPointName}
					options={[
						{
							label: "Natural",
							value: "",
						},
						{
							label: "Horizontal",
							value: "horizontal",
						},
						{
							label: "Vertical",
							value: "vertical",
						},
					]}
					onchange={onchange} /> : <></>)}

				{((props.canSetWidth || props.canSetClass) ? <UnitValue
					instance={props.targetElementNode}
					cssPropName={"width"}
					computedKey={"kaleflowerComputedWidth"}
					breakPointName={breakPointName}
					onchange={onchange} /> : <></>)}

				{((props.canSetHeight || props.canSetClass) ? <UnitValue
					instance={props.targetElementNode}
					cssPropName={"height"}
					computedKey={"kaleflowerComputedHeight"}
					breakPointName={breakPointName}
					onchange={onchange} /> : <></>)}

				{((props.canSetClass) ? <UnitValue
					instance={props.targetElementNode}
					cssPropName={"font-size"}
					breakPointName={breakPointName}
					onchange={onchange} /> : <></>)}

				{((props.canSetScrollable || props.canSetClass) ? <Select
					instance={props.targetElementNode}
					cssPropName={"overflow"}
					breakPointName={breakPointName}
					options={[
						{
							label: "Scrollable",
							value: "auto",
						},
						{
							label: "Nothing",
							value: "",
						},
					]}
					onchange={onchange} /> : <></>)}

				<div className="kaleflower-element-editor__property">
					<div className="kaleflower-element-editor__property-key">
						custom style:
					</div>
					<div className="kaleflower-element-editor__property-val">
						<textarea
							className={`px2-input`}
							value={(()=>{
								if(typeof(props.currentClassName) !== typeof('string')){
									const textContent = props.targetElementNode.getAttribute(`style${breakPointName ? '--'+breakPointName : ''}`) || '';
									return textContent;
								}
								const textContent = Array.from(props.targetElementNode.childNodes)
									.filter(node => node.nodeType === 3) // Filter for text nodes (nodeType 3)
									.map(node => node.textContent)
									.join('');
								return textContent;
							})()}
							onInput={(event)=>{
								const newStyleSheet = event.target.value;

								if(typeof(props.currentClassName) !== typeof('string')){
									props.targetElementNode.setAttribute(`style${breakPointName ? '--'+breakPointName : ''}` || '', newStyleSheet);
								}else{
									const textNodes = Array.from(props.targetElementNode.childNodes)
										.filter(node => node.nodeType === 3);
									if (textNodes.length > 0) {
										// Replace content of the first text node
										textNodes[0].textContent = newStyleSheet;
										
										// Clear content of any additional text nodes
										for (let i = 1; i < textNodes.length; i++) {
											textNodes[i].textContent = '';
										}
									} else {
										// If no text nodes exist, create one and insert at the beginning
										const newTextNode = document.createTextNode(newStyleSheet);
										props.targetElementNode.insertBefore(newTextNode, props.targetElementNode.firstChild);
									}
								}

								onchange(globalState.selectedInstance);
							}} />
					</div>
				</div>
			</div>
		</>
	);
};

export default StylingFields;

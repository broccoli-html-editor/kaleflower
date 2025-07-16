import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext';
import Text from './FormInputs/Text.jsx';
import Select from './FormInputs/Select.jsx';
import TextArea from './FormInputs/TextArea.jsx';
import UnitValue from './FormInputs/UnitValue.jsx';
import ColorPicker from './FormInputs/ColorPicker.jsx';
import ContentsDirection from './FormInputs/ContentsDirection.jsx';
const postcss = require('postcss');
const scss = require('postcss-scss');

const StylingFields = (props) => {
	const globalState = useContext(MainContext);
	const breakPointName = (!props.hasCssClassName ? props.breakPointName : null);
		// NOTE: classNameがある場合、ブレイクポイントの編集対象の要素(props.targetElementNode)は media要素になるので、
		// breakPointName を意識する必要がない。
		// 通常の要素を編集する場合は、同じ要素に接尾辞 `--${props.breakPointName}` を付けた属性に値を保存するので、
		// この値を使ってブレイクポイントの値を取得する必要があるので、 `<Text />` に引き回す。

	const customStylesheetTextareaRef = useRef(null);

	useEffect(() => {
		customStylesheetTextareaRef.current.value = (()=>{
			if(typeof(props.currentClassName) !== typeof('string')){
				const textContent = props.targetElementNode.getAttribute(`style${breakPointName ? '--'+breakPointName : ''}`) || '';
				return textContent;
			}
			const textContent = Array.from(props.targetElementNode.childNodes)
				.filter(node => node.nodeType === 3) // Filter for text nodes (nodeType 3)
				.map(node => node.textContent)
				.join('');
			return textContent;
		})();

		// クリーンアップ処理
		return () => {
		};
	}, [props.targetElementNode]);

	function onchange(){
		const onchange = props.onchange || function(){};
		onchange(globalState.selectedInstance);
	}

	return (
		<>
			<div className={`kaleflower-styling-fields ${!props.isActive ? 'kaleflower-styling-fields--is-inactive' : ''}`}>
				{((props.canBeLayer) ? <>
					<Select
						instance={props.targetElementNode}
						hasCssClassName={props.hasCssClassName}
						cssPropName={"position"}
						breakPointName={breakPointName}
						options={[
							{
								label: "",
								value: "",
							},
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
						]}
						onchange={onchange} />
					<UnitValue
						instance={props.targetElementNode}
						hasCssClassName={props.hasCssClassName}
						cssPropName={"top"}
						breakPointName={breakPointName}
						onchange={onchange} />
					<UnitValue
						instance={props.targetElementNode}
						hasCssClassName={props.hasCssClassName}
						cssPropName={"right"}
						breakPointName={breakPointName}
						onchange={onchange} />
					<UnitValue
						instance={props.targetElementNode}
						hasCssClassName={props.hasCssClassName}
						cssPropName={"bottom"}
						breakPointName={breakPointName}
						onchange={onchange} />
					<UnitValue
						instance={props.targetElementNode}
						hasCssClassName={props.hasCssClassName}
						cssPropName={"left"}
						breakPointName={breakPointName}
						onchange={onchange} />
				</> : <></>)}

				{((props.canSetContentsDirection) ? <ContentsDirection
					instance={props.targetElementNode}
					hasCssClassName={props.hasCssClassName}
					breakPointName={breakPointName}
					onchange={onchange} /> : <></>)}

				{((props.canSetWidth) ? <UnitValue
					instance={props.targetElementNode}
					hasCssClassName={props.hasCssClassName}
					cssPropName={"width"}
					computedKey={"kaleflowerComputedWidth"}
					breakPointName={breakPointName}
					onchange={onchange} /> : <></>)}

				{((props.canSetHeight) ? <UnitValue
					instance={props.targetElementNode}
					hasCssClassName={props.hasCssClassName}
					cssPropName={"height"}
					computedKey={"kaleflowerComputedHeight"}
					breakPointName={breakPointName}
					onchange={onchange} /> : <></>)}

				{((props.canSetClass) ? <UnitValue
					instance={props.targetElementNode}
					hasCssClassName={props.hasCssClassName}
					cssPropName={"font-size"}
					breakPointName={breakPointName}
					onchange={onchange} /> : <></>)}

				{((1) ? <ColorPicker
					instance={props.targetElementNode}
					hasCssClassName={props.hasCssClassName}
					cssPropName={"background-color"}
					breakPointName={breakPointName}
					onchange={onchange} /> : <></>)}

				{((props.canSetScrollable) ? <Select
					instance={props.targetElementNode}
					hasCssClassName={props.hasCssClassName}
					cssPropName={"overflow"}
					breakPointName={breakPointName}
					options={[
						{
							label: "",
							value: "",
						},
						{
							label: "Scrollable",
							value: "auto",
						},
					]}
					onchange={onchange} /> : <></>)}

				<div className="kaleflower-element-editor__property">
					<div className="kaleflower-element-editor__property-key">
						custom style:
					</div>
					<div className="kaleflower-element-editor__property-val">
						<textarea
							ref={customStylesheetTextareaRef}
							className={`px2-input px2-input--block`}
							defaultValue={(()=>{
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
								try {
									const newStyleSheet = event.target.value;

									// SCSS文法チェック
									// 文法が壊れていたら、ここで例外が発生する。
									postcss().process(newStyleSheet, {
										syntax: scss,
									}).root;

									if(typeof(props.currentClassName) !== typeof('string')){
										const styleAttrName = `style${breakPointName ? '--'+breakPointName : ''}`;
										if(!newStyleSheet.trim().length){
											props.targetElementNode.removeAttribute(styleAttrName);
										}else{
											props.targetElementNode.setAttribute(styleAttrName, newStyleSheet);
										}
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
								} catch(e) {
								}
							}} />
					</div>
				</div>
			</div>
		</>
	);
};

export default StylingFields;

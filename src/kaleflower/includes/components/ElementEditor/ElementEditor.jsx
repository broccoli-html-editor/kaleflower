import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Accordion from './../common/Accordion/Accordion.jsx';
import StylingFields from './StylingFields.jsx';
import Text from './FormInputs/Text.jsx';
import InnerHtml from './FormInputs/InnerHtml.jsx';
import {Utils} from "../../utils/Utils.js";
const utils = new Utils();
import jQuery from "jquery";
const $ = jQuery;
import * as sass from 'sass';

const ElementEditor = (props) => {
	const globalState = useContext(MainContext);

	const currentInstance = globalState.selectedInstance;
	const currentComponent = (currentInstance ? globalState.components.get_component(currentInstance.tagName) : null);
	const isVoidElement = (currentComponent ? currentComponent.isVoidElement : null);
	const isElementNode = (currentInstance ? !currentInstance.nodeName.match(/^\#/) : null);
	const currentClassName = (() => {
		let className = (isElementNode && currentInstance ? currentInstance.getAttribute('class') : null);
		if(typeof(className) == typeof('string')){
			className = className.replace(/^([a-zA-Z0-9\-\_]*)[\s\S]*$/, '$1');
			className = className.trim();
		}
		return className;
	})();
	const currentOnClick = (isElementNode && currentInstance ? currentInstance.getAttribute('onclick') : null);
	const currentOnSubmit = (isElementNode && currentInstance ? currentInstance.getAttribute('onsubmit') : null);

	const canSetCss = (currentComponent ? currentComponent.canSetCss : null);
	const canSetClass = (currentComponent ? currentComponent.canSetClass : null);
	const canSetWidth = (currentComponent ? currentComponent.canSetWidth : null);
	const canSetHeight = (currentComponent ? currentComponent.canSetHeight : null);
	const canSetContentsDirection = (currentComponent ? currentComponent.canSetContentsDirection : null);
	const canSetScrollable = (currentComponent ? currentComponent.canSetScrollable : null);
	const canBeLayer = (currentComponent ? currentComponent.canBeLayer : null);
	const canSetOnClickEvent = (currentComponent ? currentComponent.canSetOnClickEvent : null);
	const canSetOnSubmitEvent = (currentComponent ? currentComponent.canSetOnSubmitEvent : null);

	const currentBreakPoint = globalState.previewViewport.breakPoint;

	useEffect(() => {
		const $fieldEditorStyle = globalState.$('<style>');
		let stylesheet = '';

		if (!currentComponent) {
			return;
		}

		currentComponent.fields.map((field, index) => {
			const currentField = globalState.fields.get_field(field.type);
			const $targetDom = $(`.kaleflower-element-editor__property-val[data-field-name="${field.name}"]`);
			if(!currentField){
				return;
			}

			$targetDom.html(utils.bindTwig(currentField.editor, (() => {
				if(currentField.format == 'plain'){
					return {
						"_": currentInstance.getAttribute(field.name),
					};
				}
				return JSON.parse(currentInstance.getAttribute(field.name)) || {};
			})()));

			if( currentField.style ){
				stylesheet += `.kaleflower-element-editor__property-val[data-field-name="${field.name}"]{ ${currentField.style} }`;
			}
			if( globalState.options.appearance == 'light' ){
				stylesheet += `.kaleflower-element-editor__property-val[data-field-name="${field.name}"]{ ${currentField.styleLight} }`;
			}else if( globalState.options.appearance == 'dark' ){
				stylesheet += `.kaleflower-element-editor__property-val[data-field-name="${field.name}"]{ ${currentField.styleDark} }`;
			}else{
				stylesheet += `
@media (prefers-color-scheme: dark) {
	.kaleflower-element-editor__property-val[data-field-name="${field.name}"]{ ${currentField.styleDark} }
}
@media (prefers-color-scheme: light) {
	.kaleflower-element-editor__property-val[data-field-name="${field.name}"]{ ${currentField.styleLight} }
}
`;
			}

			$targetDom.find('input, select, textarea')
				.on('input', function () {
					const $targetDom = $(this);
					const fieldName = $targetDom.attr('name');
					let fieldValues;
					if(currentField.format == 'json'){
						fieldValues = JSON.parse(currentInstance.getAttribute(field.name)) || {};
						fieldValues[fieldName] = $targetDom.val();
						currentInstance.setAttribute(field.name, JSON.stringify(fieldValues));
					}else{
						fieldValues = $targetDom.val();
						currentInstance.setAttribute(field.name, fieldValues);
					}
					onchange(currentInstance);
				});

			currentField.onload(
				$targetDom.get(0),
				{
					"assets": globalState.assets,
					"extra": globalState.options.extra,
				}
			);

			return;
		});

		try {
			// SCSSをCSSに変換
			const result = sass.compileString(stylesheet, {
				style: 'compressed'
			});
			$fieldEditorStyle.html(result.css);
		} catch (error) {
			// SCSS構文エラーの場合は、元のstylesheetをそのまま使用
			console.warn('SCSS compilation failed, using original stylesheet:', error);
			$fieldEditorStyle.html(stylesheet);
		}
		
		globalState.$(document.head).append($fieldEditorStyle);

		// クリーンアップ処理
		return () => {
			$fieldEditorStyle.remove();
		};
	}, [currentComponent, currentInstance]);

	if( !currentInstance ){
		return (<div className="kaleflower-element-editor" onClick={(event)=>{
			event.stopPropagation();
		}}></div>);
	}

	if( currentClassName && !globalState.styles[currentClassName] ){
		// create new style if not exists
		const newStyle = document.createElementNS('', 'style');
		newStyle.innerHTML = '';
		newStyle.setAttribute('class', currentClassName);
		globalState.styles[currentClassName] = newStyle;

		// 参照されていないclassを削除する
		Object.keys(globalState.styles).map((className) => {
			let counter = 0;
			Object.keys(globalState.contents).map((bowlName) => {
				try {
					const $bowl = $(globalState.contents[bowlName]);
					const $found = $bowl.find(`.${className}`);
					counter += $found.length;
				}catch(e){
				}
			});
			if(!counter && className.length){
				globalState.styles[className].remove();
				delete globalState.styles[className];
			}
		});
	}

	const currentStyle = (currentClassName && globalState.styles[currentClassName] ? globalState.styles[currentClassName] : null);
	const hasCssClassName = !!(canSetClass && currentClassName && currentStyle);
	const currentStyleBreakPoints = {};

	if (currentStyle) {
		// ブレイクポイント別の media要素を取得する
		// ない場合は作成し、初期化する。
		Object.keys(globalState.configs['break-points']).forEach((breakPointName) => {
			const breakPoint = globalState.configs['break-points'][breakPointName];
			let mediaElement = Array.from(currentStyle.children).find(child => child.getAttribute('break-point') === breakPointName);

			if (!mediaElement) {
				mediaElement = document.createElementNS('', 'media');
				mediaElement.setAttribute('break-point', breakPointName);
				currentStyle.appendChild(mediaElement);
			}
			currentStyleBreakPoints[breakPointName] = mediaElement;
		});
	}


	function setKaleflowerComputedValues(propKey, attrKey){
		if(!isElementNode){
			return;
		}
		if( !currentInstance[propKey] ){
			if( currentStyle ){
				currentInstance[propKey] = currentStyle.getAttribute(attrKey);
				currentInstance.removeAttribute(attrKey)
			}else{
				currentInstance[propKey] = currentInstance.getAttribute(attrKey);
			}
		}
	}

	setKaleflowerComputedValues('kaleflowerComputedWidth', 'width');
	setKaleflowerComputedValues('kaleflowerComputedHeight', 'height');

	function onchange(){
		const onchange = props.onchange || function(){};
		onchange(currentInstance);
		props.kaleflower.trigger('change');
	}

	return (
		<div className="kaleflower-element-editor" onClick={(event)=>{
			event.stopPropagation();
		}}>
			{currentInstance
				? <>
					{!isElementNode
						? <>
							{/* Text Node */}
							<div className="kaleflower-element-editor__property">
								<div className="kaleflower-element-editor__property-key">
									nodeValue:
								</div>
								<div className="kaleflower-element-editor__property-val">
									<textarea
										className={`px2-input px2-input--block`}
										value={typeof(currentInstance.nodeValue) == typeof('string') ? currentInstance.nodeValue : ''}
										onInput={(event)=>{
											const newNodeValue = event.target.value;
											currentInstance.nodeValue = newNodeValue;

											onchange(currentInstance);
										}}></textarea>
								</div>
							</div>
						</>
						: <>
							{/* Element Node */}
							<div className="kaleflower-element-editor__property">
								<div className="kaleflower-element-editor__property-key">
									nodeName:
								</div>
								<div className="kaleflower-element-editor__property-val">
									<code>&lt;{currentInstance.nodeName}&gt;</code>
								</div>
							</div>

							{currentComponent.fields.length
								? <>
									<div>
										<p>Custom Fields:</p>
									{currentComponent.fields.map((field, index) => {
										// カスタムフィールドの編集欄を表示する
										const currentField = globalState.fields.get_field(field.type);
										return <div key={index} className="kaleflower-element-editor__property">
											<div className="kaleflower-element-editor__property-key">
												{field.label}:
											</div>
											<div className="kaleflower-element-editor__property-val" data-field-name={field.name} dangerouslySetInnerHTML={{__html: ''}} />
										</div>
									})}
									</div>
								</>
								: <></>}

							{!isVoidElement ? <InnerHtml
								instance={currentInstance}
								attrName="innerHTML"
								onchange={onchange}
								/> : <></>}

							{((canSetCss && canSetClass) ? <Text
								instance={currentInstance}
								attrName="class"
								onchange={onchange} /> : <></>)}

							{(canSetCss ? <>
								<Accordion
									label={hasCssClassName ? `class .${currentClassName}` : `Default styles`}
									id={currentInstance}
									opened={!currentBreakPoint ? true : false}
								>
									<StylingFields
										isActive={!currentBreakPoint ? true : false}
										hasCssClassName={hasCssClassName}
										targetElementNode={hasCssClassName ? currentStyle : currentInstance}
										canSetCss={canSetCss}
										canSetClass={canSetClass}
										currentClassName={currentClassName}
										canBeLayer={canBeLayer}
										canSetContentsDirection={canSetContentsDirection}
										canSetWidth={canSetWidth}
										canSetHeight={canSetHeight}
										canSetScrollable={canSetScrollable}
										onchange={onchange} />
								</Accordion>
								{globalState.configs && globalState.configs['break-points']
									? <>
										{Object.keys(globalState.configs['break-points']).map((breakPointName, index) => {
											const breakPoint = globalState.configs['break-points'][breakPointName];
											return <Accordion
												key={breakPointName}
												label={`Break point ${breakPoint['max-width']}px`}
												id={currentInstance}
												opened={currentBreakPoint && currentBreakPoint.name == breakPoint.name ? true : false}
											>
												<StylingFields
													isActive={currentBreakPoint && currentBreakPoint.name == breakPoint.name ? true : false}
													hasCssClassName={hasCssClassName}
													targetElementNode={hasCssClassName ? currentStyleBreakPoints[breakPointName] : currentInstance}
													canSetCss={canSetCss}
													canSetClass={canSetClass}
													currentClassName={currentClassName}
													canBeLayer={canBeLayer}
													canSetContentsDirection={canSetContentsDirection}
													canSetWidth={canSetWidth}
													canSetHeight={canSetHeight}
													canSetScrollable={canSetScrollable}
													breakPointName={breakPointName}
													onchange={onchange} />
											</Accordion>
										})}
									</>
									: <></>}

							</> : <></>)}

							{(canSetOnClickEvent ? <>
								{/* Element Node */}
								<div className="kaleflower-element-editor__property">
									<div className="kaleflower-element-editor__property-key">
										onclick:
									</div>
									<div className="kaleflower-element-editor__property-val">
									<textarea
										className={`px2-input px2-input--block`}
										value={currentOnClick}
										onInput={(event)=>{
											const newOnClick = event.target.value;
											currentInstance.setAttribute('onclick', newOnClick);
											if(!newOnClick.trim().length){
												currentInstance.removeAttribute('onclick');
											}

											onchange(currentInstance);
										}}></textarea>
									</div>
								</div>
							</> : <></>)}

							{(canSetOnSubmitEvent ? <>
								{/* Element Node */}
								<div className="kaleflower-element-editor__property">
									<div className="kaleflower-element-editor__property-key">
										onsubmit:
									</div>
									<div className="kaleflower-element-editor__property-val">
									<textarea
										className={`px2-input px2-input--block`}
										value={currentOnSubmit}
										onInput={(event)=>{
											const newOnSubmit = event.target.value;
											currentInstance.setAttribute('onsubmit', newOnSubmit);
											if(!newOnSubmit.trim().length){
												currentInstance.removeAttribute('onsubmit');
											}

											onchange(currentInstance);
										}}></textarea>
									</div>
								</div>
							</> : <></>)}

						</>
					}


					{/* <div className="kaleflower-element-editor__property">
						<div className="kaleflower-element-editor__property-key">
							ID:
						</div>
						<div className="kaleflower-element-editor__property-val">
							{currentInstance.kaleflowerInstanceId}
						</div>
					</div> */}
					<hr />
					<p><button
						className={`px2-btn px2-btn--danger`}
						onClick={()=>{
							currentInstance.remove();
							const onremove = props.onremove() || function(){};
							onremove();
							props.kaleflower.trigger('change');
						}}>remove</button></p>
				</>
				: <></>}
		</div>
	);
};

export default ElementEditor;

import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Accordion from './../common/Accordion/Accordion.jsx';
import StylingFields from './StylingFields.jsx';
import Text from './FormInputs/Text.jsx';
import {Utils} from "../../utils/Utils.js";
const utils = new Utils();
import jQuery from "jquery";
const $ = jQuery;

const ElementEditor = (props) => {
	const globalState = useContext(MainContext);

	const currentInstance = globalState.selectedInstance;
	const currentComponent = (currentInstance ? globalState.components.get_component(currentInstance.tagName) : null);
	const isVoidElement = (currentComponent ? currentComponent.isVoidElement : null);
	const isElementNode = (currentInstance ? !currentInstance.nodeName.match(/^\#/) : null);
	const currentClassName = (isElementNode && currentInstance ? currentInstance.getAttribute('class') : null);

	const canSetClass = (currentComponent ? currentComponent.canSetClass : null);
	const canSetWidth = (currentComponent ? currentComponent.canSetWidth : null);
	const canSetHeight = (currentComponent ? currentComponent.canSetHeight : null);
	const canSetContentsDirection = (currentComponent ? currentComponent.canSetContentsDirection : null);
	const canSetScrollable = (currentComponent ? currentComponent.canSetScrollable : null);
	const canBeLayer = (currentComponent ? currentComponent.canBeLayer : null);

	const currentBreakPoint = globalState.previewViewport.breakPoint;

	useEffect(() => {
		if (!currentComponent) {
			return;
		}
		currentComponent.fields.map((field, index) => {
			const currentField = globalState.fields.get_field(field.type);
			const $targetDom = $(`.kaleflower-element-editor__property-val[data-field-name="${field.name}"]`);

			$targetDom.html(utils.bindTwig(currentField.editor, (() => {
				if(currentField.format == 'plain'){
					return {
						"_": currentInstance.getAttribute(field.name),
					};
				}
				return JSON.parse(currentInstance.getAttribute(field.name)) || {};
			})()));

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
					const onchange = props.onchange || function(){};
					onchange(currentInstance);
				});

			currentField.onload(
				$targetDom.get(0),
				{
					"$": jQuery,
					"assets": globalState.assets,
				}
			);

			return;
		});

		// クリーンアップ処理
		return () => {
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
		newStyle.setAttribute('width', currentInstance.kaleflowerComputedWidth);
		newStyle.setAttribute('height', currentInstance.kaleflowerComputedHeight);
		currentInstance.removeAttribute('width');
		currentInstance.removeAttribute('height');
		globalState.styles[currentClassName] = newStyle;

		// 参照されていないclassを削除する
		Object.keys(globalState.styles).map((className) => {
			let counter = 0;
			Object.keys(globalState.contents).map((bowlName) => {
				const $bowl = $(globalState.contents[bowlName]);
				const $found = $bowl.find(`.${className}`);
				counter += $found.length;
			});
			if(!counter){
				globalState.styles[className].remove();
				delete globalState.styles[className];
			}
		});
	}

	const currentStyle = (currentClassName && globalState.styles[currentClassName] ? globalState.styles[currentClassName] : null);
	const hasCssClassName = (canSetClass && currentClassName && currentStyle);
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
										className={`px2-input`}
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

							{!isVoidElement
								? <>
									<div className="kaleflower-element-editor__property">
										<div className="kaleflower-element-editor__property-key">
											innerHTML:
										</div>
										<div className="kaleflower-element-editor__property-val">
											<textarea
												className={`px2-input`}
												value={typeof(currentInstance.innerHTML) == typeof('string') ? currentInstance.innerHTML : ''}
												onInput={(event)=>{
													const newInnerHTML = event.target.value;
													currentInstance.innerHTML = newInnerHTML;

													onchange(currentInstance);
												}}></textarea>
										</div>
									</div>
								</>
								: <></>}

							{(canSetClass ? <Text
								instance={currentInstance}
								attrName="class"
								onchange={onchange} /> : <></>)}

							<Accordion
								label={hasCssClassName ? `class .${currentClassName}` : `Default styles`}
								id={currentInstance}
								opened={!currentBreakPoint ? true : false}
							>
								<StylingFields
									isActive={!currentBreakPoint ? true : false}
									hasCssClassName={hasCssClassName}
									targetElementNode={hasCssClassName ? currentStyle : currentInstance}
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

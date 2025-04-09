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

	const currentComponent = (globalState.selectedInstance ? globalState.components.get_component(globalState.selectedInstance.tagName) : null);
	const isVoidElement = (currentComponent ? currentComponent.isVoidElement : null);
	const isElementNode = (globalState.selectedInstance ? !globalState.selectedInstance.nodeName.match(/^\#/) : null);
	const currentClassName = (isElementNode && globalState.selectedInstance ? globalState.selectedInstance.getAttribute('class') : null);

	const canSetClass = (currentComponent ? currentComponent.canSetClass : null);
	const canSetWidth = (currentComponent ? currentComponent.canSetWidth : null);
	const canSetHeight = (currentComponent ? currentComponent.canSetHeight : null);
	const canSetContentsDirection = (currentComponent ? currentComponent.canSetContentsDirection : null);
	const canSetScrollable = (currentComponent ? currentComponent.canSetScrollable : null);
	const canBeLayer = (currentComponent ? currentComponent.canBeLayer : null);

	useEffect(() => {
		if (!currentComponent) {
			return;
		}
		currentComponent.fields.map((field, index) => {
			const currentField = globalState.fields.get_field(field.type);
			const $targetDom = $(`.kaleflower-element-editor__property-val[data-field-name="${field.name}"]`);

			$targetDom.html(utils.bindTwig(currentField.editor, (() => {
				return JSON.parse(globalState.selectedInstance.getAttribute(field.name)) || {};
			})()));

			$targetDom.find('input, select, textarea')
				.on('input', function () {
					const $targetDom = $(this);
					const fieldValues = JSON.parse(globalState.selectedInstance.getAttribute(field.name)) || {};
					fieldValues[$targetDom.attr('name')] = $targetDom.val();

					globalState.selectedInstance.setAttribute(field.name, JSON.stringify(fieldValues));

					const onchange = props.onchange || function(){};
					onchange(globalState.selectedInstance);
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
	}, [currentComponent, globalState.selectedInstance]);

	if( !globalState.selectedInstance ){
		return (<div className="kaleflower-element-editor" onClick={(event)=>{
			event.stopPropagation();
		}}></div>);
	}

	if( currentClassName && !globalState.styles[currentClassName] ){
		// create new style if not exists
		const newStyle = document.createElementNS('', 'style');
		newStyle.innerHTML = '';
		newStyle.setAttribute('class', currentClassName);
		newStyle.setAttribute('width', globalState.selectedInstance.kaleflowerComputedWidth);
		newStyle.setAttribute('height', globalState.selectedInstance.kaleflowerComputedHeight);
		globalState.selectedInstance.removeAttribute('width');
		globalState.selectedInstance.removeAttribute('height');
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
		if( !globalState.selectedInstance[propKey] ){
			if( currentStyle ){
				globalState.selectedInstance[propKey] = currentStyle.getAttribute(attrKey);
				globalState.selectedInstance.removeAttribute(attrKey)
			}else{
				globalState.selectedInstance[propKey] = globalState.selectedInstance.getAttribute(attrKey);
			}
		}
	}

	setKaleflowerComputedValues('kaleflowerComputedWidth', 'width');
	setKaleflowerComputedValues('kaleflowerComputedHeight', 'height');

	function onchange(){
		const onchange = props.onchange || function(){};
		onchange(globalState.selectedInstance);
		props.kaleflower.trigger('change');
	}

	return (
		<div className="kaleflower-element-editor" onClick={(event)=>{
			event.stopPropagation();
		}}>
			{globalState.selectedInstance
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
										value={typeof(globalState.selectedInstance.nodeValue) == typeof('string') ? globalState.selectedInstance.nodeValue : ''}
										onInput={(event)=>{
											const newNodeValue = event.target.value;
											globalState.selectedInstance.nodeValue = newNodeValue;

											onchange(globalState.selectedInstance);
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
									<code>&lt;{globalState.selectedInstance.nodeName}&gt;</code>
								</div>
							</div>
							{(canSetClass ? <Text
								instance={globalState.selectedInstance}
								attrName="class"
								onchange={onchange} /> : <></>)}

							<Accordion
								label={hasCssClassName ? `class .${currentClassName}` : `Default styles`}
								id={globalState.selectedInstance}
							>
								<StylingFields
									hasCssClassName={hasCssClassName}
									targetElementNode={hasCssClassName ? currentStyle : globalState.selectedInstance}
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
											id={globalState.selectedInstance}
										>
											<StylingFields
												hasCssClassName={hasCssClassName}
												targetElementNode={hasCssClassName ? currentStyleBreakPoints[breakPointName] : globalState.selectedInstance}
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

							{currentComponent.fields.length
								? <>
									<div className="">
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
												value={typeof(globalState.selectedInstance.innerHTML) == typeof('string') ? globalState.selectedInstance.innerHTML : ''}
												onInput={(event)=>{
													const newInnerHTML = event.target.value;
													globalState.selectedInstance.innerHTML = newInnerHTML;

													onchange(globalState.selectedInstance);
												}}></textarea>
										</div>
									</div>
								</>
								: <></>}

						</>
					}


					{/* <div className="kaleflower-element-editor__property">
						<div className="kaleflower-element-editor__property-key">
							ID:
						</div>
						<div className="kaleflower-element-editor__property-val">
							{globalState.selectedInstance.kaleflowerInstanceId}
						</div>
					</div> */}
					<hr />
					<p><button
						className={`px2-btn px2-btn--danger`}
						onClick={()=>{
							globalState.selectedInstance.remove();
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

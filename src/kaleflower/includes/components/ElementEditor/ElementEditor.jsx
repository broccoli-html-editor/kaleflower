import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Attribute from './Attribute.jsx';
import {Utils} from "../../utils/Utils.js";
const utils = new Utils();
import jQuery from "jquery";
const $ = jQuery;

const ElementEditor = (props) => {
	const globalState = useContext(MainContext);
	const currentComponent = (props.selectedInstance ? globalState.components.get_component(props.selectedInstance.tagName) : null);
	const isVoidElement = (currentComponent ? currentComponent.isVoidElement : null);
	const canSetClass = (currentComponent ? currentComponent.canSetClass : null);
	const canSetWidth = (currentComponent ? currentComponent.canSetWidth : null);
	const canSetHeight = (currentComponent ? currentComponent.canSetHeight : null);
	const isElementNode = (props.selectedInstance ? !props.selectedInstance.nodeName.match(/^\#/) : null);
	const currentClassName = (isElementNode && props.selectedInstance ? props.selectedInstance.getAttribute('class') : null);

	useEffect(() => {
		if( !currentComponent ){
			return;
		}
		currentComponent.fields.map((field, index) => {
			const currentField = globalState.fields.get_field(field.type);
			const $targetDom = $(`.kaleflower-element-editor__property-val[data-field-name="${field.name}"]`);

			$targetDom.html(utils.bindTwig(currentField.editor, (() => {
				return JSON.parse(props.selectedInstance.getAttribute(field.name)) || {};
			})()));
			currentField.onload($targetDom.get(0));

			$targetDom.find('input, select, textarea')
				.on('input', function(){
					const $targetDom = $(this);
					const fieldValues = JSON.parse(props.selectedInstance.getAttribute(field.name)) || {};
					fieldValues[$targetDom.attr('name')] = $targetDom.val();

					props.selectedInstance.setAttribute(field.name, JSON.stringify(fieldValues));

					const onchange = props.onchange() || function(){};
					onchange(props.selectedInstance);
				} );

			return;
		});

		// クリーンアップ処理
		return () => {
		};
	}, [currentComponent, props.selectedInstance]);

	if( !props.selectedInstance ){
		return (<div className="kaleflower-element-editor" onClick={(event)=>{
			event.preventDefault();
			event.stopPropagation();
		}}></div>);
	}

	if( currentClassName && !globalState.styles[currentClassName] ){
		// create new style if not exists
		const newStyle = document.createElementNS('', 'style');
		newStyle.innerHTML = '';
		newStyle.setAttribute('class', currentClassName);
		newStyle.setAttribute('width', props.selectedInstance.kaleflowerComputedWidth);
		newStyle.setAttribute('height', props.selectedInstance.kaleflowerComputedHeight);
		props.selectedInstance.removeAttribute('width');
		props.selectedInstance.removeAttribute('height');
		globalState.styles[currentClassName] = newStyle;
	}

	const currentStyle = (currentClassName && globalState.styles[currentClassName] ? globalState.styles[currentClassName] : null);

	function setKaleflowerComputedValues(propKey, attrKey){
		if(!isElementNode){
			return;
		}
		if( !props.selectedInstance[propKey] ){
			if( currentStyle ){
				props.selectedInstance[propKey] = currentStyle.getAttribute(attrKey);
				props.selectedInstance.removeAttribute(attrKey)
			}else{
				props.selectedInstance[propKey] = props.selectedInstance.getAttribute(attrKey);
			}
		}
	}

	setKaleflowerComputedValues('kaleflowerComputedWidth', 'width');
	setKaleflowerComputedValues('kaleflowerComputedHeight', 'height');

	function onchange(){
		const onchange = props.onchange() || function(){};
		onchange(props.selectedInstance);
	}

	return (
		<div className="kaleflower-element-editor" onClick={(event)=>{
			event.preventDefault();
			event.stopPropagation();
		}}>
			{props.selectedInstance
				? <>
					<div className="kaleflower-element-editor__property">
						<div className="kaleflower-element-editor__property-key">
							nodeName:
						</div>
						<div className="kaleflower-element-editor__property-val">
							{props.selectedInstance.nodeName}
						</div>
					</div>

					{isElementNode
						? <>
							{(canSetClass ? <Attribute
								instance={props.selectedInstance}
								attrName="class"
								onchange={onchange} /> : <></>)}

							{(canSetWidth ? <Attribute
								instance={props.selectedInstance}
								attrName="width"
								computedKey="kaleflowerComputedWidth"
								onchange={onchange} /> : <></>)}

							{(canSetHeight ? <Attribute
								instance={props.selectedInstance}
								attrName="height"
								computedKey="kaleflowerComputedHeight"
								onchange={onchange} /> : <></>)}

							{!isVoidElement
								? <>
									<div className="kaleflower-element-editor__property">
										<div className="kaleflower-element-editor__property-key">
											innerHTML:
										</div>
										<div className="kaleflower-element-editor__property-val">
											<textarea value={typeof(props.selectedInstance.innerHTML) == typeof('string') ? props.selectedInstance.innerHTML : ''} onInput={(event)=>{
												const newInnerHTML = event.target.value;
												props.selectedInstance.innerHTML = newInnerHTML;

												onchange(props.selectedInstance);
											}}></textarea>
										</div>
									</div>
								</>
								: <></>}

							{canSetClass && currentClassName && currentStyle
								? <>
									<p>class <code>.{currentClassName}</code></p>
									{(canSetWidth ? <Attribute
										instance={currentStyle}
										attrName="width"
										computedKey="kaleflowerComputedWidth"
										onchange={onchange} /> : <></>)}

									{(canSetHeight ? <Attribute
										instance={currentStyle}
										attrName="height"
										computedKey="kaleflowerComputedHeight"
										onchange={onchange} /> : <></>)}

									<div className="kaleflower-element-editor__property">
										<div className="kaleflower-element-editor__property-key">
											style:
										</div>
										<div className="kaleflower-element-editor__property-val">
											<textarea value={typeof(currentClassName) == typeof('string') ? currentStyle.innerHTML : ''} onInput={(event)=>{
												const newStyleSheet = event.target.value;
												currentStyle.innerHTML = newStyleSheet;

												onchange(props.selectedInstance);
											}} />
										</div>
									</div>
								</>
								: <></>}

							{currentComponent.fields.length
								? <>
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
								</>
								: <></>}
						</>
						: <>
							<div className="kaleflower-element-editor__property">
								<div className="kaleflower-element-editor__property-key">
									nodeValue:
								</div>
								<div className="kaleflower-element-editor__property-val">
									<textarea value={typeof(props.selectedInstance.nodeValue) == typeof('string') ? props.selectedInstance.nodeValue : ''} onInput={(event)=>{
										const newNodeValue = event.target.value;
										props.selectedInstance.nodeValue = newNodeValue;

										onchange(props.selectedInstance);
									}}></textarea>
								</div>
							</div>
						</>}


					<div className="kaleflower-element-editor__property">
						<div className="kaleflower-element-editor__property-key">
							ID:
						</div>
						<div className="kaleflower-element-editor__property-val">
							{props.selectedInstance.kaleflowerNodeId}
						</div>
					</div>
					<button onClick={()=>{
						props.selectedInstance.remove();
						const onremove = props.onremove() || function(){};
						onremove();
					}}>remove</button>
				</>
				: <></>}
		</div>
	);
};

export default ElementEditor;

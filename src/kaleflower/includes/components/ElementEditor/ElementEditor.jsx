import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Attribute from './Attribute.jsx';
import {Utils} from "../../utils/Utils.js";

const ElementEditor = (props) => {
	const globalState = useContext(MainContext);
	const currentComponent = (props.selectedInstance ? globalState.components.get_component(props.selectedInstance.tagName) : null);

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

					{!props.selectedInstance.nodeName.match(/^\#/)
						? <>
							<Attribute
								instance={props.selectedInstance}
								attrName="class"
								onchange={onchange} />

							<Attribute
								instance={props.selectedInstance}
								attrName="width"
								onchange={onchange} />

							<Attribute
								instance={props.selectedInstance}
								attrName="height"
								onchange={onchange} />

							{!currentComponent.isVoidElement
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

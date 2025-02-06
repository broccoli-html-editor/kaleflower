import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import {Utils} from "../../utils/Utils.js";

const Node = React.memo((props) => {
	const globalState = useContext(MainContext);
	const utils = new Utils();

	const content = props.node;
	if( !content.kaleflowerInstanceId ){
		content.kaleflowerInstanceId = utils.createUUID();
	}

	const currentComponent = (content ? globalState.components.get_component(content.tagName) : null);

	if( content.nodeName == '#text' && content.textContent.trim() == '' ){
		return <></>;
	}
	if( content.nodeName == '#comment' ){
		return <></>;
	}

	function selectInstance(event){
		event.preventDefault();
		event.stopPropagation();
		const onselectinstance = props.onselectinstance || function(){};
		onselectinstance(content);
	}

	function hoverInstance(event){
		event.preventDefault();
		event.stopPropagation();
		const onhoverinstance = props.onhoverinstance || function(){};
		onhoverinstance(content);
	}

	function appendChild(event){
		event.preventDefault();
		event.stopPropagation();

		const newChildElementTagName = prompt('element name', 'div');
		if(!newChildElementTagName){
			return;
		}
		const newChild = utils.appendChild(content, newChildElementTagName);
		props.onselectinstance(newChild);
	}

	return (<>
		<div
			key={props.key}
			onClick={selectInstance}
			onMouseOver={hoverInstance}

			onDragStart={(event)=>{
				event.stopPropagation();
				const sendData = {
					kaleflowerInstanceId: content.kaleflowerInstanceId,
					instancePath: props.instancePath,
				};
				event.dataTransfer.setData("text/json", JSON.stringify(sendData) );
				const onselectinstance = props.onselectinstance || function(){};
				onselectinstance(content);
			}}
			onDragEnter={(event)=>{}}
			onDragOver={(event)=>{
				event.preventDefault();
			}}
			onDragLeave={(event)=>{}}
			onDrop={(event)=>{
				event.preventDefault();
				event.stopPropagation();
				let transferData = event.dataTransfer.getData("text/json");
				try {
					transferData = JSON.parse(transferData);
				} catch (e) {}

				const moveFromInstance = globalState.selectedInstance;
				const moveToInstance = content;
				const parentNode = content.parentNode;

				parentNode.insertBefore(moveFromInstance, moveToInstance);
				props.onselectinstance(moveFromInstance);

			}}
			onDragEnd={(event)=>{}}

			data-kaleflower-instance-id={content.kaleflowerInstanceId}
			data-kaleflower-instance-path={`${props.instancePath}`}
			className={"kaleflower-insance-tree-view__node"+(globalState.selectedInstance && globalState.selectedInstance.kaleflowerInstanceId == content.kaleflowerInstanceId ? ' kaleflower-insance-tree-view__node--selected' : '')}
			draggable="true">
			<p className="kaleflower-insance-tree-view__node-name">{content.nodeName == '#text' ? content.nodeName : content.tagName}</p>
			<ul className="kaleflower-insance-tree-view__node-list">
				{Array.from(content.childNodes).map((child, index) => {
					if( child.nodeName == '#text' && child.textContent.trim() == '' ){
						return <li key={index}></li>;
					}
					if( child.nodeName == '#comment' ){
						return <li key={index}></li>;
					}
					return (
						<li key={index}>
							<Node
								node={child}
								instancePath={`${props.instancePath}.childNodes[${index}]`}
								onselectinstance={props.onselectinstance} />
						</li>
					);
				})}
				{(content.nodeName != '#text' && content.nodeName != '#comment' && !currentComponent.isVoidElement) ? (
					<li>
						<button onClick={appendChild}>append</button>
					</li>
				) : <></>}
			</ul>
		</div>
	</>);
});

export default Node;

import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import {Utils} from "../../utils/Utils.js";

const Node = React.memo((props) => {
	const globalState = useContext(MainContext);
	const utils = new Utils();

	const content = props.node;
	if( !content.kaleflowerNodeId ){
		content.kaleflowerNodeId = utils.createUUID();
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
		const onselect = props.onselect || function(){};
		onselect(content);
	}

	function appendChild(event){
		event.preventDefault();
		event.stopPropagation();

		const newChildElementTagName = prompt('element name', 'div');
		if(!newChildElementTagName){
			return;
		}
		const newChild = utils.appendChild(content, newChildElementTagName);
		props.onselect(newChild);
	}

	return (<>
		<div
			key={props.key}
			onClick={selectInstance}

			onDragStart={(event)=>{
				event.stopPropagation();
				const sendData = {
					kaleflowerNodeId: content.kaleflowerNodeId,
					instancePath: props.instancePath,
				};
				event.dataTransfer.setData("text/json", JSON.stringify(sendData) );
				const onselect = props.onselect || function(){};
				onselect(content);
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
				props.onselect(moveFromInstance);

			}}
			onDragEnd={(event)=>{}}

			data-kaleflower-node-id={content.kaleflowerNodeId}
			data-kaleflower-instance-path={`${props.instancePath}`}
			className={"kaleflower-insance-tree-view__node"+(globalState.selectedInstance && globalState.selectedInstance.kaleflowerNodeId == content.kaleflowerNodeId ? ' kaleflower-insance-tree-view__node--selected' : '')}
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
								onselect={props.onselect} />
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

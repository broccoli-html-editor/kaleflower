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

	if( content.nodeName == '#text' && content.textContent.trim() == '' ){
		return <></>;
	}
	if( content.nodeName == '#comment' ){
		return <></>;
	}

	function onclick(event){
		event.preventDefault();
		event.stopPropagation();
		console.log(event.currentTarget);
		globalState.selectedNode = event.currentTarget.attributes['data-kaleflower-node-id'].value;
		const onselect = props.onselect || function(){};
		onselect(globalState.selectedNode);
	}

	return (<>
		<div key={props.key} onClick={onclick} data-kaleflower-node-id={content.kaleflowerNodeId} className={"kaleflower-insance-tree-view__node"+(globalState.selectedNode == content.kaleflowerNodeId ? ' kaleflower-insance-tree-view__node--selected' : '')} draggable="true">
			<p className="kaleflower-insance-tree-view__node-name">{content.nodeName == '#text' ? content.nodeName : content.tagName}</p>
			{(Array.from(content.childNodes).length > 0) &&
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
								<Node node={child} onselect={props.onselect} />
							</li>
						);
					})}
				</ul>
			}
		</div>
	</>);
});

export default Node;

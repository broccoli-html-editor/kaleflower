import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import ContentElementNode from './ContentElementNode.jsx';
import {Utils} from "../../utils/Utils.js";
import Icons from '../Icons/Icons.jsx';

const InstanceTreeView = React.memo((props) => {
	const globalState = useContext(MainContext);
	const utils = new Utils();

	return (
		<div className="kaleflower-insance-tree-view">
			{Object.keys(globalState.contents).map((key, index) => {
				const content = globalState.contents[key];
				console.log('key', key, content);
				return (<div key={index} className="kaleflower-insance-tree-view__bowl">
					<p className="kaleflower-insance-tree-view__title">{key}</p>
					<ul className="kaleflower-insance-tree-view__node-list">
						{Array.from(content.childNodes).map((child, index) => {
							if( child.nodeName == '#text' && child.textContent.trim() == '' ){
								return;
							}
							if( child.nodeName == '#comment' ){
								return;
							}
							return (
								<li key={index}>
									<ContentElementNode
										node={child}
										instancePath={`document[name="${key}"].childNodes[${index}]`}
										onselectinstance={props.onselectinstance}
										onhoverinstance={props.onhoverinstance}
										onmoveinstance={props.onmoveinstance}
										ondragover={props.ondragover}
										oncreatenewinstance={props.oncreatenewinstance}
										/>
								</li>
							);
						})}
						{(content.nodeName != '#text' && content.nodeName != '#comment' && !Array.from(content.childNodes).filter(currentNode=>currentNode.nodeType == Node.ELEMENT_NODE).length) ? (
							<li>
								<button
									className={`px2-btn px2-btn--secondary px2-btn--block`}
									onClick={(event) => {
										event.preventDefault();
										event.stopPropagation();
										props.oncreatenewinstance(content, 'append');
									}}
									onDrop={(event)=>{
										event.preventDefault();
										event.stopPropagation();
										let transferData = event.dataTransfer.getData("text/json");
										try {
											transferData = JSON.parse(transferData);
										} catch (e) {}

										const moveFromInstance = globalState.selectedInstance;
										const moveToInstance = content;
										props.onmoveinstance(moveFromInstance, moveToInstance, 'append');
									}}
									><Icons type="plus" /></button>
							</li>
						) : <></>}
					</ul>
				</div>);
			}
			)}
		</div>
	);
});

export default InstanceTreeView;

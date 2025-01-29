import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Node from './Node.jsx';
import {Utils} from "../../utils/Utils.js";

const InstanceTreeView = React.memo((props) => {
	const globalState = useContext(MainContext);
	const utils = new Utils();

	return (
		<div className="kaleflower-insance-tree-view">
			{Object.keys(props.contents).map((key, index) => {
				const content = props.contents[key];
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
									<Node
										node={child}
										instancePath={`document[name="${key}"].childNodes[${index}]`}
										onselect={props.onselectinstance}
										onhover={props.onhoverinstance} />
								</li>
							);
						})}
						<li>
							<button onClick={function appendChild(event){
								event.preventDefault();
								event.stopPropagation();
								const newChildElementTagName = prompt('element name', 'div');
								if(!newChildElementTagName){
									return;
								}
								const newChild = utils.appendChild(content, newChildElementTagName);
								props.onselectinstance(newChild);
							}}>append</button>
						</li>
					</ul>
				</div>);
			}
			)}
		</div>
	);
});

export default InstanceTreeView;

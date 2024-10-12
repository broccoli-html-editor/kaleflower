import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Node from './Node.jsx';

const InstanceTreeView = React.memo((props) => {
	const globalState = useContext(MainContext);

	return (
		<div className="kaleflower-insance-tree-view">
			{Object.keys(props.contents).map((key, index) => {
				const content = props.contents[key];
				return (<div key={index} className="kaleflower-insance-tree-view__bowl">
					<p className="kaleflower-insance-tree-view__title">{key}</p>
					{(Array.from(content.childNodes).length > 0) &&
						<ul className="kaleflower-insance-tree-view__node-list">
							{Array.from(content.childNodes).map((child, index) => {
								if( child.nodeName == '#text' && child.textContent.trim() == '' ){
									return <></>;
								}
								if( child.nodeName == '#comment' ){
									return <></>;
								}
								return (
									<li key={index}>
										<Node node={child} onselect={props.onselectnode} />
									</li>
								);
							})}
						</ul>
					}
				</div>);
			}
			)}
		</div>
	);
});

export default InstanceTreeView;

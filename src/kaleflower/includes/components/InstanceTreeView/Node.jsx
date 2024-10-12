import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';

const Node = React.memo((props) => {
	const globalState = useContext(MainContext);

	const content = props.node;

	return (<>
		<div key={props.key}>
			<p>{props.key}</p>
			<ul>
				{Array.from(content.childNodes).map((child, index) => {
					if( child.nodeName == '#text' && child.textContent.trim() == '' ){
						return null;
					}
					if( child.nodeName == '#comment' ){
						return null;
					}
					return (
						<li key={index}>
							<div>{child.nodeName == '#text' ? child.nodeName : child.tagName}</div>
							<Node node={child} />
						</li>
					);
				})}
			</ul>
		</div>
	</>);
});

export default Node;

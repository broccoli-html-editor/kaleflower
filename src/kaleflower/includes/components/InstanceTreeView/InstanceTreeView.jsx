import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Node from './Node.jsx';

const InstanceTreeView = React.memo((props) => {
	const globalState = useContext(MainContext);

	return (
		<div className="kaleflower-insance-tree-view">
			<p>Instance Tree View</p>
			{Object.keys(props.contents).map((key, index) => {
				const content = props.contents[key];
				return (<>
					<p>{key}</p>
					<Node node={content} />
				</>);
			}
			)}
		</div>
	);
});

export default InstanceTreeView;

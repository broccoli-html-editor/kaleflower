import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import Property from './Property.jsx';
import {Utils} from "../../utils/Utils.js";

const ElementEditor = (props) => {
	const globalState = useContext(MainContext);
	const utils = new Utils();
	const [selectedInstance, setSelectedInstance] = useState(props.selectedInstance);

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
							<Property
								instance={props.selectedInstance}
								attrName="class"
								onchange={onchange} />

							<Property
								instance={props.selectedInstance}
								attrName="width"
								onchange={onchange} />

							<Property
								instance={props.selectedInstance}
								attrName="height"
								onchange={onchange} />
						</>
						: <>
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

import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import {Utils} from "../../utils/Utils.js";

const ElementEditor = React.memo((props) => {
	const globalState = useContext(MainContext);
	const utils = new Utils();

	return (
		<div className="kaleflower-element-editor">
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
					}}>remove</button>
				</>
				: <></>}
		</div>
	);
});

export default ElementEditor;

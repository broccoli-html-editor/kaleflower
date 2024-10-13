import React, { useContext, useState, useEffect } from "react";
import { MainContext } from '../../context/MainContext';
import {Utils} from "../../utils/Utils.js";

const Property = (props) => {
	const globalState = useContext(MainContext);
	const utils = new Utils();

	return (
        <div className="kaleflower-element-editor__property">
            <div className="kaleflower-element-editor__property-key">
                {props.attrName}:
            </div>
            <div className="kaleflower-element-editor__property-val">
                <input value={typeof(props.instance.getAttribute(props.attrName)) == typeof('string') ? props.instance.getAttribute(props.attrName) : ''} onInput={(event)=>{
                    const newValue = event.target.value;

                    props.instance.setAttribute(props.attrName, newValue);
                    if( !newValue.length ){
                        props.instance.removeAttribute(props.attrName);
                    }

                    const onchange = props.onchange() || function(){};
                    onchange(props.instance);
                }} />
            </div>
        </div>
	);
};

export default Property;

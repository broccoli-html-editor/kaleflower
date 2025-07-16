import React, { useContext, useState, useEffect, useRef } from "react";

const ClassName = (props) => {
	const inputRef = useRef(null);
	const attrName = 'class';
	let applyTimer;

	useEffect(() => {
		inputRef.current.value = typeof(props.instance.getAttribute(attrName)) == typeof('string') ? props.instance.getAttribute(attrName) : '';

		// クリーンアップ処理
		return () => {
		};
	}, [props.instance]);

	return (
		<div className="kaleflower-element-editor__property">
			<div className="kaleflower-element-editor__property-key">
				class:
			</div>
			<div className="kaleflower-element-editor__property-val">
				<input
					ref={inputRef}
					type={`text`}
					className={`px2-input px2-input--block`}
					defaultValue={typeof(props.instance.getAttribute(attrName)) == typeof('string') ? props.instance.getAttribute(attrName) : ''}
					onInput={(event)=>{
						clearTimeout(applyTimer);
						applyTimer = setTimeout(() => {
							const newValue = event.target.value;

							if(props.computedKey){
								props.instance[props.computedKey] = newValue;
							}

							if( newValue.trim().length ){
								props.instance.setAttribute(attrName, newValue);
							}else{
								props.instance.removeAttribute(attrName);
							}

							const onchange = props.onchange() || function(){};
							onchange(props.instance);
						}, 300);
					}} />
			</div>
		</div>
	);
};

export default ClassName;

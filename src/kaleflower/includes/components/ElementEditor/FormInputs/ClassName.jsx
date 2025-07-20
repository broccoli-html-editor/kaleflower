import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../../context/MainContext';

const ClassName = (props) => {
	const globalState = useContext(MainContext);
	const currentInstance = globalState.selectedInstance;

	const inputRef = useRef(null);
	const attrName = 'class';
	let applyTimer;

	useEffect(() => {
		inputRef.current.value = typeof(props.instance.getAttribute(attrName)) == typeof('string') ? props.instance.getAttribute(attrName) : '';

		// クリーンアップ処理
		return () => {
		};
	}, [props.instance]);

	const copyElementStylesToNewClass = ((newClassName) => {
		const newStyle = document.createElementNS('', 'style');
		newStyle.innerHTML = '';
		newStyle.setAttribute('class', newClassName);

		if (currentInstance.hasAttribute('style')) {
			newStyle.innerHTML = currentInstance.getAttribute('style');
			currentInstance.removeAttribute('style');
		}

		if (globalState.configs['break-points']) {
			Object.keys(globalState.configs['break-points']).forEach((breakPointName) => {
				if(currentInstance.hasAttribute(`style--${breakPointName}`)){
					const newMedia = document.createElementNS('', 'media');
					newMedia.innerHTML = currentInstance.getAttribute(`style--${breakPointName}`);
					newMedia.setAttribute('break-point', breakPointName);
					newStyle.appendChild(newMedia);
					currentInstance.removeAttribute(`style--${breakPointName}`);
				}
			});
		}
		globalState.styles[newClassName] = newStyle;
	});

	const copyPastClassStylesToNewClass = ((pastClassName, newClassName) => {
		if(globalState.styles[pastClassName]){
			const newStyle = globalState.styles[pastClassName].cloneNode(true);
			newStyle.setAttribute('class', newClassName);
			globalState.styles[newClassName] = newStyle;
		}
	});

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
						const prevClassName = props.instance.getAttribute(attrName);

						clearTimeout(applyTimer);
						applyTimer = setTimeout(() => {
							const newClassName = event.target.value;

							if (props.computedKey) {
								props.instance[props.computedKey] = newClassName;
							}

							if (newClassName.trim().length) {
								props.instance.setAttribute(attrName, newClassName);

								if (typeof(prevClassName) == typeof('string') && prevClassName.length) {
									copyPastClassStylesToNewClass(prevClassName, newClassName);
								} else {
									copyElementStylesToNewClass(newClassName);
								}

							} else {
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

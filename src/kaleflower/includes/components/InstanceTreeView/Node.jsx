import React, { useContext, useState, useEffect, useRef } from "react";
import { MainContext } from '../../context/MainContext';
import Icons from '../Icons/Icons.jsx';

const Node = React.memo((props) => {
	const globalState = useContext(MainContext);
	const $ = globalState.jQuery;
	const panelRef = useRef(null);
	const utils = globalState.utils;
	const content = props.node;
	if( !content.kaleflowerInstanceId ){
		content.kaleflowerInstanceId = utils.createUUID();
	}

	const currentComponent = (content ? globalState.components.get_component(content.tagName) : null);

	if( content.nodeName == '#text' && content.textContent.trim() == '' ){
		return <></>;
	}
	if( content.nodeName == '#comment' ){
		return <></>;
	}

	function selectInstance(event){
		event.preventDefault();
		event.stopPropagation();
		const onselectinstance = props.onselectinstance || function(){};
		onselectinstance(content);
	}

	function hoverInstance(event){
		event.preventDefault();
		event.stopPropagation();
		const onhoverinstance = props.onhoverinstance || function(){};
		onhoverinstance(content);
	}

	async function appendChild(event){
		event.preventDefault();
		event.stopPropagation();
		props.oncreatenewinstance(content, 'append');
	}

	/**
	 * マウス座標の四象限の位置を得る
	 */
	function getUd(e, elm){
		var posx = 0;
		var posy = 0;
		if (!e) e = window.event;
		if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		}else if (e.clientX || e.clientY) {
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		var mousepos = { x : posx, y : posy };

		var docScrolls = {
			left : document.body.scrollLeft + document.documentElement.scrollLeft,
			top : document.body.scrollTop + document.documentElement.scrollTop
		};
		var bounds = elm.getBoundingClientRect(); // 対象要素の情報取得
		var relmousepos = {
			x : mousepos.x - bounds.left - docScrolls.left,
			y : mousepos.y - bounds.top - docScrolls.top
		};

		var ud = {};
		if( relmousepos.y < $(elm).height()/3 ){
			ud.y = 'u';
		}else if( relmousepos.y > $(elm).height()/3*2 ){
			ud.y = 'd';
		}else{
			ud.y = 'c';
		}
		if( relmousepos.x < $(elm).width()/3 ){
			ud.x = 'l';
		}else if( relmousepos.x > $(elm).width()/3*2 ){
			ud.x = 'r';
		}else{
			ud.x = 'c';
		}
		return ud;
	}

	function getDirectionByUd(ud){
		let direction = 'append';
		if( ud.y == 'u' ){
			direction = 'before';
		}else if( ud.y == 'd' ){
			direction = 'after';
		}
		return direction;
	}

	return (<>
		<div
			ref={panelRef}
			key={props.key}
			onClick={selectInstance}
			onMouseOver={hoverInstance}

			onDragEnter={(event)=>{}}
			onDragOver={(event)=>{
				event.preventDefault();
				event.stopPropagation();
				const ud = getUd(event, panelRef.current);
				const direction = getDirectionByUd(ud);
				props.ondragover(content, direction);
			}}
			onDragLeave={(event)=>{}}
			onDrop={(event)=>{
				event.preventDefault();
				event.stopPropagation();
				const ud = getUd(event, panelRef.current);
				const direction = getDirectionByUd(ud);
				let transferData = event.dataTransfer.getData("text/json");
				try {
					transferData = JSON.parse(transferData);
				} catch (e) {}

				const moveFromInstance = globalState.selectedInstance;
				const moveToInstance = content;
				props.onmoveinstance(moveFromInstance, moveToInstance, direction);
			}}
			onDragEnd={(event)=>{}}

			data-kaleflower-instance-id={content.kaleflowerInstanceId}
			data-kaleflower-instance-path={`${props.instancePath}`}
			className={`kaleflower-insance-tree-view__node`
				+ `${(globalState.selectedInstance && globalState.selectedInstance.kaleflowerInstanceId == content.kaleflowerInstanceId ? ' kaleflower-insance-tree-view__node--selected' : '')}`
				+ `${(globalState.hoveredInstance && globalState.hoveredInstance.kaleflowerInstanceId == content.kaleflowerInstanceId ? ' kaleflower-insance-tree-view__node--hovered' : '')}`
				}
			>
			<div className="kaleflower-insance-tree-view__node-name"
				onDragStart={(event)=>{
					event.stopPropagation();
					const sendData = {
						kaleflowerInstanceId: content.kaleflowerInstanceId,
						instancePath: props.instancePath,
					};
					event.dataTransfer.setData("text/json", JSON.stringify(sendData) );
					const onselectinstance = props.onselectinstance || function(){};
					onselectinstance(content);
				}}
				draggable="true"
				>{content.nodeName == '#text' ? content.nodeName : (currentComponent.label ? currentComponent.label : `<${content.tagName}>`)}</div>
			<ul className="kaleflower-insance-tree-view__node-list">
				{Array.from(content.childNodes).map((child, index) => {
					if( child.nodeName == '#text' && child.textContent.trim() == '' ){
						return <li key={index}></li>;
					}
					if( child.nodeName == '#comment' ){
						return <li key={index}></li>;
					}
					return (
						<li key={index}>
							<Node
								node={child}
								instancePath={`${props.instancePath}.childNodes[${index}]`}
								onselectinstance={props.onselectinstance}
								onhoverinstance={props.onhoverinstance}
								onmoveinstance={props.onmoveinstance}
								ondragover={props.ondragover}
								oncreatenewinstance={props.oncreatenewinstance}
								/>
						</li>
					);
				})}
				{(content.nodeName != '#text' && content.nodeName != '#comment' && !currentComponent.isVoidElement && !content.childNodes.length) ? (
					<li>
						<button
							className={`px2-btn px2-btn--secondary px2-btn--block`}
							onClick={appendChild}
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
		</div>
	</>);
});

export default Node;

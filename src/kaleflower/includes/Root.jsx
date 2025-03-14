import React, { useContext, useState, useEffect } from "react";
import { MainContext } from './context/MainContext';
import InstanceTreeView from './components/InstanceTreeView/InstanceTreeView.jsx';
import ElementEditor from './components/ElementEditor/ElementEditor.jsx';
import LayoutView from './components/LayoutView/LayoutView.jsx';
import AppearanceStyles from './components/AppearanceStyles/AppearanceStyles.jsx';
import {Utils} from './utils/Utils.js';
import {CreateNewInstance} from './utils/CreateNewInstance.js';
import iterate79 from 'iterate79';

const Root = React.memo((props) => {
	// const main = useContext(MainContext);

	// State management using useState hook
	const [globalState, setGlobalState] = useState({});

	globalState.utils = new Utils();
	globalState.options = props.options;
	globalState.lb = props.lb;

	useEffect(() => {
		// カスタムイベントをリッスンしてデータを取得
		const handleDataLoaded = (event) => {
			let newState = {
				...globalState,
				...event.detail,
			};
			setGlobalState(newState); // イベントからデータを取得してstateにセット
		};

		window.addEventListener(`kaleflower-${props['kflow-proc-id']}-state-updated`, handleDataLoaded);

		// クリーンアップ処理
		return () => {
			window.removeEventListener(`kaleflower-${props['kflow-proc-id']}-state-updated`, handleDataLoaded);
		};
	}, []);

	function getInstanceById(instanceId){
		if(typeof(instanceId) == typeof({type:"object"})){
			return instanceId;
		}
		let rtn;
		function getInstanceById(node){
			if(node.kaleflowerInstanceId == instanceId){
				return node;
			}
			let rtn = false;
			Array.from(node.childNodes).forEach((child) => {
				const result = getInstanceById(child);
				if(result){
					rtn = result;
					return false;
				}
			});
			return rtn;
		}
		Object.keys(globalState.contents).forEach((key) => {
			const content = globalState.contents[key];
			const findedInstance = getInstanceById(content);
			if(findedInstance){
				rtn = findedInstance;
				return false;
			}
		});
		return rtn;
	}

	function selectInstance(instance){
		instance = getInstanceById(instance);
		const newGlobalState = {
			...globalState,
			selectedInstance: instance,
			hoveredInstanceDirection: null,
		};
		setGlobalState(newGlobalState);
	}

	function hoverInstance(instance){
		instance = getInstanceById(instance);
		const newGlobalState = {
			...globalState,
			hoveredInstance: instance,
			hoveredInstanceDirection: null,
		};
		setGlobalState(newGlobalState);
	}

	function dragoverInstance(instance, direction){
		instance = getInstanceById(instance);
		const newGlobalState = {
			...globalState,
			hoveredInstance: instance,
			hoveredInstanceDirection: direction,
		};
		setGlobalState(newGlobalState);
	}

	function unselectInstance(){
		const newGlobalState = {
			...globalState,
			selectedInstance: null,
			hoveredInstance: null,
			hoveredInstanceDirection: null,
		};
		setGlobalState(newGlobalState);
	}

	async function createNewInstance(targetElement, direction){
		targetElement = getInstanceById(targetElement);
		direction = direction || 'before';
		const currentComponent = (targetElement ? globalState.components.get_component(targetElement.tagName) : null);
		if(direction == 'append' && currentComponent.isVoidElement){
			return;
		}

		return new Promise((done, fail)=>{
			const createNewInstance = new CreateNewInstance();
			createNewInstance.openSelectDialog().then((newChildElementTagName)=>{
				if(!newChildElementTagName){
					fail();
					return;
				}
				done(newChildElementTagName);
			});
		}).then((newChildElementTagName)=>{
			return new Promise((done, fail)=>{
				const newChild = document.createElementNS('', newChildElementTagName);
				newChild.kaleflowerInstanceId = globalState.utils.createUUID();
				if( direction == 'before' ){
					targetElement.parentNode.insertBefore(newChild, targetElement);
				}else if( direction == 'after' ){
					targetElement.parentNode.insertBefore(newChild, targetElement.nextSibling);
				}else if( direction == 'prepend' ){
					if(targetElement.childNodes.length){
						targetElement.insertBefore(newChild, targetElement.childNodes[0]);
					}else{
						targetElement.appendChild(newChild);
					}
				}else{
					targetElement.appendChild(newChild);
				}
				selectInstance(newChild);
				done();
				return;
			});
		});
	}

	function moveInstance(instance, moveToInstance, direction){
		instance = getInstanceById(instance);
		moveToInstance = getInstanceById(moveToInstance);
		const parentNode = moveToInstance.parentNode;
		const currentComponent = (moveToInstance ? globalState.components.get_component(moveToInstance.tagName) : null);

		if(direction == 'append'){
			if(currentComponent.isVoidElement){
				return;
			}
			moveToInstance.appendChild(instance);
		}else if(direction == 'after'){
			parentNode.insertBefore(instance, moveToInstance.nextSibling);
		}else{
			parentNode.insertBefore(instance, moveToInstance);
		}
		selectInstance(instance);
	}

	if(!globalState.components){
		return (
			<MainContext.Provider value={globalState}>
				<p>NO XML LOADED.</p>
			</MainContext.Provider>
		);
	}

	return (
		<MainContext.Provider value={globalState}>
			<AppearanceStyles appearance={globalState.options.appearance} />
			<div className="kaleflower__frame" onClick={unselectInstance}>
				<div className="kaleflower__header">
				</div>

				<div className="kaleflower__body">
					<div className="kaleflower__body-left">
						<InstanceTreeView
							onselectinstance={selectInstance}
							onhoverinstance={hoverInstance}
							onmoveinstance={moveInstance}
							ondragover={dragoverInstance}
							oncreatenewinstance={createNewInstance} />
					</div>
					<div className="kaleflower__body-center">
						<LayoutView
							onselectinstance={selectInstance}
							onhoverinstance={hoverInstance}
							onmoveinstance={moveInstance}
							ondragover={dragoverInstance}
							oncreatenewinstance={createNewInstance} />
					</div>
					<div className="kaleflower__body-right">
						{/*
						<ul>
							{Object.keys(globalState.components.get_system_components()).map((key) => {
								const component = globalState.components.get_component(key);
								return (
									<li key={key}>
										{component.tagName}
									</li>
								);
							})}
							{Object.keys(globalState.components.get_custom_components()).map((key) => {
								const component = globalState.components.get_component(key);
								return (
									<li key={key}>
										{component.tagName}
									</li>
								);
							})}
						</ul>
						*/}

						<ElementEditor
							onchange={(selectedInstance)=>{selectInstance(selectedInstance);}}
							onremove={unselectInstance}
							/>
					</div>
				</div>

				<div className="kaleflower__footer">
				</div>
			</div>
		</MainContext.Provider>
	);
});

export default Root;

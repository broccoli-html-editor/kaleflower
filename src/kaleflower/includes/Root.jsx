import React, { useContext, useState, useEffect } from "react";
import { MainContext } from './context/MainContext';
import InstanceTreeView from './components/InstanceTreeView/InstanceTreeView.jsx';
import ElementEditor from './components/ElementEditor/ElementEditor.jsx';
import LayoutView from './components/LayoutView/LayoutView.jsx';
import ToolBar from './components/ToolBar/ToolBar.jsx';
import AppearanceStyles from './components/AppearanceStyles/AppearanceStyles.jsx';
import {Utils} from './utils/Utils.js';
import {CreateNewInstance} from './utils/CreateNewInstance.js';
import iterate79 from 'iterate79';

const Root = React.memo((props) => {
	// const main = useContext(MainContext);

	// State management using useState hook
	const [globalState, setGlobalState] = useState({
		previewViewport: {
			width: null,
			height: null,
			breakPoint: null,
		},
		selectedViewportSize: null,
		editWindowOpened: false,
	});

	globalState.utils = new Utils();
	globalState.options = props.options;
	globalState.lb = props.lb;
	globalState.setGlobalState = setGlobalState;

	useEffect(() => {
		// カスタムイベントをリッスンしてデータを取得
		const handleDataLoaded = (event) => {
			setGlobalState((pastState) => {
				let newState = {
					...pastState,
					...event.detail,
				};
				return newState;
			});
		};

		window.addEventListener(`kaleflower-${props['kflow-proc-id']}-state-updated`, handleDataLoaded);

		// クリーンアップ処理
		return () => {
			window.removeEventListener(`kaleflower-${props['kflow-proc-id']}-state-updated`, handleDataLoaded);
		};
	}, []);

	globalState.getInstanceById = function(instanceId){
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
		const selectedInstance = globalState.getInstanceById(instance);
		setGlobalState((pastState) => {
			const newGlobalState = {
				...pastState,
				selectedInstance: selectedInstance,
				hoveredInstanceDirection: null,
			};
			return newGlobalState;
		});
	}

	function hoverInstance(instance){
		instance = globalState.getInstanceById(instance);
		setGlobalState((pastState) => {
			const newGlobalState = {
				...pastState,
				hoveredInstance: instance,
				hoveredInstanceDirection: null,
			};
			return newGlobalState;
		});
	}

	function dragoverInstance(instance, direction){
		instance = globalState.getInstanceById(instance);
		setGlobalState((pastState) => {
			const newGlobalState = {
				...pastState,
				hoveredInstance: instance,
				hoveredInstanceDirection: direction,
			};
			return newGlobalState;
		});
	}

	function unselectInstance(){
		setGlobalState((pastState) => {
			const newGlobalState = {
				...pastState,
				selectedInstance: null,
				hoveredInstance: null,
				hoveredInstanceDirection: null,
			};
			return newGlobalState;
		});
	}

	async function createNewInstance(targetElement, direction){
		targetElement = globalState.getInstanceById(targetElement);
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
				props.kaleflower.trigger('change');
				done();
				return;
			});
		});
	}

	function moveInstance(instance, moveToInstance, direction){
		instance = globalState.getInstanceById(instance);
		moveToInstance = globalState.getInstanceById(moveToInstance);
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
		props.kaleflower.trigger('change');
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
					<ToolBar />
				</div>

				<div className="kaleflower__body">
					<div className="kaleflower__body-left">
						<InstanceTreeView
							kaleflower={props.kaleflower}
							onselectinstance={selectInstance}
							onhoverinstance={hoverInstance}
							onmoveinstance={moveInstance}
							ondragover={dragoverInstance}
							oncreatenewinstance={createNewInstance} />
					</div>
					<div className="kaleflower__body-center">
						<LayoutView
							kaleflower={props.kaleflower}
							viewportWidth={globalState.selectedViewportSize}
							onchangeviewportstatus={(event)=>{
								setGlobalState((prevState) => {
									// 現在のプレビューの画面幅から、該当するブレイクポイントを特定する
									let currentBreakPoint = null;
									Object.keys(globalState.configs['break-points']).forEach((breakPointName) => {
										const breakPoint = globalState.configs['break-points'][breakPointName];
										const maxWidth = Number(breakPoint['max-width']);
										if(maxWidth < event.width){
											return;
										}
										if(currentBreakPoint && maxWidth > Number(currentBreakPoint['max-width'])){
											return;
										}
										currentBreakPoint = breakPoint;
									});
									prevState.previewViewport.breakPoint = currentBreakPoint;
									prevState.previewViewport.width = event.width;
									prevState.previewViewport.height = event.height;
									return prevState;
								});
							}}
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
							kaleflower={props.kaleflower}
							onchange={(selectedInstance)=>{selectInstance(selectedInstance);}}
							onremove={unselectInstance}
							/>
					</div>
				</div>

				<div className="kaleflower__footer">
				</div>
				{globalState.selectedInstance && globalState.editWindowOpened &&
				<div className="kaleflower__edit-window">
					<div className="kaleflower__edit-window__inner">
						<div className="px2-text-align-right">
							<button
								type="button"
								className="px2-btn"
								onClick={()=>{
									setGlobalState((prevState) => {
										prevState.editWindowOpened = false;
										return prevState;
									});
								}}
							>close</button>
						</div>
						<ElementEditor
							kaleflower={props.kaleflower}
							onchange={(selectedInstance)=>{selectInstance(selectedInstance);}}
							onremove={unselectInstance}
							/>
					</div>
				</div>
				}
			</div>
		</MainContext.Provider>
	);
});

export default Root;

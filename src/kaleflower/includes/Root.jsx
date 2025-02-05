import React, { useContext, useState, useEffect } from "react";
import { MainContext } from './context/MainContext';
import InstanceTreeView from './components/InstanceTreeView/InstanceTreeView.jsx';
import ElementEditor from './components/ElementEditor/ElementEditor.jsx';
import LayoutView from './components/LayoutView/LayoutView.jsx';
import {Utils} from './utils/Utils.js';
import iterate79 from 'iterate79';
import LangBank from 'langbank';

const languageCsv = require('../../../data/language.csv');

const Root = React.memo((props) => {
	// const main = useContext(MainContext);

	// State management using useState hook
	const [globalState, setGlobalState] = useState({});

	globalState.utils = new Utils();
	globalState.options = props.options;

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

	function unselectInstance(){
		const newGlobalState = {
			...globalState,
			selectedInstance: null,
			hoveredInstance: null,
		};
		setGlobalState(newGlobalState);
	}

	function getInstanceById(instance){
		let rtn;
		function getInstanceById(node){
			if(node.kaleflowerInstanceId == instance){
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
		if(typeof(instance) == typeof('string')){
			// instance が文字列の場合(= インスタンスIDで指定された場合)、
			// globalState.contents からインスタンスを検索する
			instance = getInstanceById(instance);
		}
		const newGlobalState = {
			...globalState,
			selectedInstance: instance,
		};
		setGlobalState(newGlobalState);
	}

	function hoverInstance(instance){
		if(typeof(instance) == typeof('string')){
			// instance が文字列の場合(= インスタンスIDで指定された場合)、
			// globalState.contents からインスタンスを検索する
			instance = getInstanceById(instance);
		}
		const newGlobalState = {
			...globalState,
			hoveredInstance: instance,
		};
		setGlobalState(newGlobalState);
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
			<div className="kaleflower__frame" onClick={unselectInstance}>
				<div className="kaleflower__header">
				</div>

				<div className="kaleflower__body">
					<div className="kaleflower__body-left">
						<InstanceTreeView
							contents={globalState.contents}
							onselectinstance={function(selectedInstance){
								selectInstance(selectedInstance);
							}}
							onhoverinstance={function(hoveredInstance){
								hoverInstance(hoveredInstance);
							}} />
					</div>
					<div className="kaleflower__body-center">
						<LayoutView
							onselectinstance={function(selectedInstance){
								selectInstance(selectedInstance);
							}}
							onhoverinstance={function(hoveredInstance){
								hoverInstance(hoveredInstance);
							}} />
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
							selectedInstance={globalState.selectedInstance}
							onchange={()=>{selectInstance(globalState.selectedInstance);}}
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

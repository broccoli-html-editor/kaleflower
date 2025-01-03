import React, { useContext, useState, useEffect } from "react";
import { MainContext } from './context/MainContext';
import InstanceTreeView from './components/InstanceTreeView/InstanceTreeView.jsx';
import ElementEditor from './components/ElementEditor/ElementEditor.jsx';
import {Utils} from './utils/Utils.js';
import iterate79 from 'iterate79';
import LangBank from 'langbank';

const languageCsv = require('../../../data/language.csv');

const Root = React.memo((props) => {
	// const main = useContext(MainContext);

	// State management using useState hook
	const [globalState, setGlobalState] = useState({});

	globalState.utils = new Utils();

	useEffect(() => {
		// カスタムイベントをリッスンしてデータを取得
		const handleDataLoaded = (event) => {
			setGlobalState(event.detail); // イベントからデータを取得してstateにセット
		};

		window.addEventListener('kaleflower-state-updated', handleDataLoaded);

		// クリーンアップ処理
		return () => {
			window.removeEventListener('kaleflower-state-updated', handleDataLoaded);
		};
	}, []);

	function unselectInstance(){
		const newGlobalState = {
			...globalState,
			selectedInstance: null,
		};
		setGlobalState(newGlobalState);
	}

	function selectInstance(instance){
		const newGlobalState = {
			...globalState,
			selectedInstance: instance,
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
							onselectnode={function(selectedInstance){
								selectInstance(selectedInstance);
							}} />
					</div>
					<div className="kaleflower__body-center">

					</div>
					<div className="kaleflower__body-right">
						<ul>
							{Object.keys(globalState.components).map((key) => {
								const component = globalState.components[key];
								return (
									<li key={key}>
										{component.tagName}
									</li>
								);
							})}
						</ul>

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

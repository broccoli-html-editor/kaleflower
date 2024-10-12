import React, { useContext, useState, useEffect } from "react";
import { MainContext } from './context/MainContext';
import iterate79 from 'iterate79';
import LangBank from 'langbank';

const languageCsv = require('../../../data/language.csv');

const Root = React.memo((props) => {
	// const main = useContext(MainContext);

	// State management using useState hook
	const [globalState, setGlobalState] = useState({});

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

	if(!globalState.components){
		return (
			<MainContext.Provider value={globalState}>
				<>NO XML LOADED.</>
			</MainContext.Provider>
		);
	}

	return (
		<MainContext.Provider value={globalState}>
			<div className="kaleflower__frame">
				{globalState.xml}
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

				<button onClick={()=>{
					const newGlobalState = {
						...globalState,
						xml: globalState.xml + 'aaa',
					};
					props.onChangeState(newGlobalState);
					setGlobalState(newGlobalState);
					}}>change</button>
			</div>
		</MainContext.Provider>
	);
});

export default Root;

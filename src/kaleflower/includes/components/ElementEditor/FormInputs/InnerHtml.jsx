import React, { useContext, useState, useEffect, useRef } from "react";

const InnerHtml = (props) => {
	const textareaRef = useRef(null);

	useEffect(() => {
		textareaRef.current.value = props.instance.innerHTML || '';

		// クリーンアップ処理
		return () => {
		};
	}, [props.instance]);

	return (
		<div className="kaleflower-element-editor__property">
			<div className="kaleflower-element-editor__property-key">
				innerHTML:
			</div>
			<div className="kaleflower-element-editor__property-val">
				<textarea
					ref={textareaRef}
					className={`px2-input px2-input--block`}
					defaultValue={typeof(props.instance.innerHTML) == typeof('string') ? props.instance.innerHTML : ''}
					onInput={(event)=>{
						try {
							const newInnerHTML = event.target.value;

							// XMLの文法チェック
							const parser = new DOMParser();
							const doc = parser.parseFromString(`<root>${newInnerHTML}</root>`, "application/xml");
							const parsererror = doc.getElementsByTagName("parsererror");
							if (parsererror.length > 0) {
								// XML文法エラーの場合は処理を中断
								return;
							}

							props.instance.innerHTML = newInnerHTML;

							props.onchange(props.instance);
						} catch (e) {
						}
					}}></textarea>
			</div>
		</div>
	);
};

export default InnerHtml;

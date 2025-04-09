import React, { useContext, useState, useEffect } from "react";

const UnitValue = (props) => {
    const attrName = (!props.hasCssClassName && props.breakPointName ? `${props.attrName}--${props.breakPointName}` : props.attrName);
    
    const units = ["px", "%", "vw", "vh", "em", "rem", "ex", "rex"];
    const keywords = ["auto", "fit-content", "min-content", "max-content", "fill", "fit", "stretch", "contain", "cover", "none"];
    
    const [numValue, setNumValue] = useState("");
    const [unitValue, setUnitValue] = useState("px");
    const [isKeyword, setIsKeyword] = useState(false);
    
    // Parse the current value into number and unit parts
    useEffect(() => {
        const currentValue = typeof(props.instance.getAttribute(attrName)) === 'string' ? props.instance.getAttribute(attrName) : '';
        
        if (keywords.includes(currentValue)) {
            setIsKeyword(true);
            setUnitValue(currentValue);
            setNumValue("");
        } else {
            // Extract number and unit using regex
            const match = currentValue.match(/^([-+]?[0-9]*\.?[0-9]+)([a-z%]*)$/i);
            if (match) {
                setNumValue(match[1]);
                setUnitValue(match[2] || "px");
                setIsKeyword(false);
            } else {
                setNumValue("");
                setUnitValue("px");
                setIsKeyword(false);
            }
        }
    }, [props.instance.getAttribute(attrName)]);
    
    // Update the attribute value
    const updateValue = (num, unit, isKeywordValue) => {
        const newValue = isKeywordValue ? unit : `${num}${unit}`;
        
        if(props.computedKey){
            props.instance[props.computedKey] = newValue;
        }

        props.instance.setAttribute(attrName, newValue);
        if (!newValue.length) {
            props.instance.removeAttribute(attrName);
        }

        const onchange = props.onchange() || function(){};
        onchange(props.instance);
    };

    return (
        <div className="kaleflower-element-editor__property">
            <div className="kaleflower-element-editor__property-key">
                {props.attrName}:
            </div>
            <div className="kaleflower-element-editor__property-val">
                <div style={{ display: 'flex' }}>
                    {!isKeyword && (
                        <input
                            type="text"
                            className="px2-input"
                            style={{ flexGrow: 1, marginRight: '5px' }}
                            value={numValue}
                            onInput={(event) => {
                                const newNum = event.target.value;
                                setNumValue(newNum);
                                updateValue(newNum, unitValue, false);
                            }}
                        />
                    )}
                    <select
                        className="px2-input"
                        value={unitValue}
                        onChange={(event) => {
                            const newUnit = event.target.value;
                            const newIsKeyword = keywords.includes(newUnit);
                            setUnitValue(newUnit);
                            setIsKeyword(newIsKeyword);
                            updateValue(numValue, newUnit, newIsKeyword);
                        }}
                    >
                        <optgroup label="Units">
                            {units.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Keywords">
                            {keywords.map(keyword => (
                                <option key={keyword} value={keyword}>{keyword}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default UnitValue;

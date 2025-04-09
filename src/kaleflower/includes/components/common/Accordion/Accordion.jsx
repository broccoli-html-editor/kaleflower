import React, { useContext, useState, useEffect } from "react";

const Accordion = (props) => {

	const [openAccordion, setOpenAccordion] = useState({});

	// Toggle function for accordions
	const toggleAccordion = () => {
		setOpenAccordion(prev => ({
			...prev,
			isOpened: !prev.isOpened,
		}));
	};

	return (
		<div className="kaleflower-accordion">
			<div className="kaleflower-accordion__header" onClick={() => toggleAccordion()} >
				<div>
					{props.label}
				</div>
				<div style={{ transform: openAccordion.isOpened ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
					▼
				</div>
			</div>
			{openAccordion.isOpened && (
				<div className="kaleflower-accordion__content">
					{props.children}
				</div>
			)}
		</div>
	);
};

export default Accordion;

import React, { useContext, useState, useEffect } from "react";

const Accordion = (props) => {

	const [openAccordion, setOpenAccordion] = useState({
		isOpened: false,
	});

	// Toggle function for accordions
	const toggleAccordion = () => {
		setOpenAccordion(prev => ({
			...prev,
			isOpened: !prev.isOpened,
		}));
	};

	useEffect(() => {
		// Initialize accordion state
		setOpenAccordion(prev => ({
			...prev,
			isOpened: false,
		}));
	}, [props.id || null]);

	return (
		<div className="kaleflower-accordion">
			<div className="kaleflower-accordion__header" onClick={() => toggleAccordion()} >
				<button type="button" className={`kaleflower-accordion__toggle-button ${openAccordion.isOpened ? 'kaleflower-accordion__toggle-button--is-opened' : ''}`}>
					{props.label}
				</button>
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

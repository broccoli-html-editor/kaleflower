import React from 'react';

const Icons = ({ type }) => {
	switch (type) {
		case 'home':
			return (
				<svg width="24" height="24" viewBox="0 0 24 24">
					<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
				</svg>
			);
		case 'search':
			return (
				<svg width="24" height="24" viewBox="0 0 24 24">
					<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z"/>
				</svg>
			);
		case 'settings':
			return (
				<svg width="24" height="24" viewBox="0 0 24 24">
					<path d="M19.14 12.94l1.43-1.43-2.12-2.12-1.43 1.43a5.978 5.978 0 00-1.43-.83l-.3-1.6h-3.54l-.3 1.6a5.978 5.978 0 00-1.43.83L5.55 9.39 3.43 11.5l1.43 1.43a5.978 5.978 0 00-.83 1.43l-1.6.3v3.54l1.6.3c.2.52.48 1.01.83 1.43l-1.43 1.43 2.12 2.12 1.43-1.43c.42.35.91.63 1.43.83l.3 1.6h3.54l.3-1.6c.52-.2 1.01-.48 1.43-.83l1.43 1.43 2.12-2.12-1.43-1.43c.35-.42.63-.91.83-1.43l1.6-.3v-3.54l-1.6-.3a5.978 5.978 0 00-.83-1.43zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
				</svg>
			);
		case 'plus':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
					<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
				</svg>
			);
		default:
			return null;
	}
};

export default Icons;

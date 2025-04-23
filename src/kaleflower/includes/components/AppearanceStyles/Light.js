import LightScss from '!!raw-loader!./Light.scss';

const Light = (props) => {
console.log('LightScss', LightScss);
	return `
${LightScss}
`;
};

export default Light;

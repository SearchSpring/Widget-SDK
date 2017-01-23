let Loader = {};

Loader.getScript = src => {
	let script = document.createElement('script');
	script.src = src;

	document.body.appendChild(script);
};

module.exports = Loader;

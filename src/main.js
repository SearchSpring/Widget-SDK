try {
	require('babel-polyfill');
} catch(e) {
	// ignore
	console.log('Unable to load babel-polyfill');
}

require('styles/index.scss');

let Widgets = require('Services/Widgets');

let scriptElem = document.querySelector('script[searchspring-id]');
let widgetsPath = scriptElem.src.replace(/\/[^\/]+$/, '') + '/widgets';
let attrs = {};
[...scriptElem.attributes]
	.filter(attr => !attr.nodeName.match(/src|type|^_/))
	.forEach(attr => attrs[attr.nodeName.toLowerCase()] = attr.nodeValue);

let widgets = new Widgets(attrs);
widgets.locator.listen(widget => widgets.loadFromElement(widget, widgetsPath));

window.SearchSpring = window.SearchSpring || {};
window.SearchSpring.Widgets = {
	register: widgets.register,
	Services: require('library/Services'),
	Components: require('library/Components'),
	Utilities: require('library/Utilities')
};

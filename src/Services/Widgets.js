let Loader = require('Utilities/Loader');
let m = require('mithril');

function WidgetElementLocator() {
	let INTERVAL = 10;

	let listeners = [];

	setInterval(() => {
		let newWidgets = [...window.document.querySelectorAll('searchspring')].filter(elem => !elem.getAttribute('_found'));

		if(!newWidgets.length) {
			return;
		}

		newWidgets.forEach(widget => {
			widget.setAttribute('_found', true);
		});

		newWidgets.forEach(widget => {
			listeners.forEach(listener => {
				listener(widget);
			});
		});
	}, INTERVAL);

	this.listen = cb => {
		listeners.push(cb);
	};
}

function load(widget, src) {
	Loader.getScript(src);
}

function register(inheritedAttrs, widget, Component) {
	let elem = [...document.querySelectorAll('searchspring[widget="' + widget + '"]')].filter(elem => !elem.getAttribute('_resolved'))[0];

	if(!elem) {
		// TODO: Should non-element widgets be allowed?
		throw 'Could not resolve widget: ' + widget;
	}

	elem.setAttribute('_resolved', true);

	let attrs = {};
	[...elem.attributes]
		.filter(attr => !attr.nodeName.match(/^_/))
		.forEach(attr => {
			attrs[attr.nodeName.toLowerCase()] = attr.nodeValue;
		});
	attrs.thisElement = elem;

	let html = elem.innerHTML;

	let view = Component.view;
	Component.view = function() {
		try {
			return view.apply(Component, arguments);
		} catch(e) {
			console.error(e);
			return m('div.render_error');
		}
	};

	if(typeof Component.view == 'function') {
		elem.innerHTML = '';

		m.mount(elem, <Component {...Object.assign({}, inheritedAttrs, attrs)}>{ m.trust(html) }</Component>);

		elem.setAttribute('_visible', true);
	} else {
		throw "Widget.register callback must return a function or mithril component";
	}
}

function loadFromElement(elem, srcRoot, attrs) {
	let widget = elem.getAttribute('widget');

	if(!widget) {
		return;
	}

	let libPath = (elem.getAttribute('src') || srcRoot).replace(/[ \/]+$/, '');

	let src = libPath + '/' + widget + '/widget.js';

	// TODO: Move element to its proper location if it has a target attr

	load(widget, src, attrs);
}

module.exports = function(attrs) {
	this.loadFromElement = loadFromElement;
	this.locator = new WidgetElementLocator();
	this.register = register.bind(null, attrs || {});
};

let Chunk = require('./Chunk');

class Location extends Chunk {
	constructor(initial, root) {
		super();

		initial = initial || window.location.href;

		if(typeof initial == 'string') {
			let splitUrl = initial.split('?');

			root = splitUrl[0];

			if(splitUrl.length >= 2) {
				this.importQuery(splitUrl.slice(1).join('&'));
			}

		} else if(typeof initial == 'object' && !(initial instanceof Array)) {
			this.importState(initial);
		}

		this._root = (root || window.location.href).split('?')[0];
	}

	importQuery(query) {
		query.split('&').filter(p => p.length).map(p => {
			let sp = p.split('=');
			let key = sp[0];
			let val = sp[1];
			return key.split('.').concat(val);
		}).filter(p => {
			return p.length >= 2;
		}).map(p => {
			return p.map(seg => decodeURIComponent(seg));
		}).forEach(p => {
			this.add.apply(this, p);
		});

		return this;
	}

	go() {
		let url = this.toString();

		if(window.history && window.history.pushState) {
			window.history.pushState({}, '', url);
		} else {
			window.location.href = url;
		}
	}

	bind(to) {
		to.location = this;
	}

	setRoot(root) {
		this._root = root;
	}

	toString(root) {
		root = root || this._root;

		let query = super.toQuery();

		return root + (query ? '?' + query : '');
	}
}

module.exports = Location;

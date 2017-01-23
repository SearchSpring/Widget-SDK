class Chunk {
	constructor(state) {
		state = state || {};

		if(typeof state != 'object') {
			throw 'Chunk must be instantiated with null or state object';
		}

		this._paths = [];
		this.importState(state);
	}

	add() {
		this._paths.push([...arguments]);

		return this;
	}

	remove() {
		let args = [...arguments];	

		this._paths = this._paths.filter(path => !this._matchWith(args, path));

		return this;
	}

	get() {
		let args = [...arguments];

		return this._paths.filter(path => this._matchWith(args, path));
	}

	getLast() {
		let gotten = this.get.apply(this, arguments).pop();

		if(!gotten) {
			return undefined;
		}

		return gotten[gotten.length - 1];
	}

	toQuery() {
		return this._paths.filter(path => path.length).map(path => {
			if(path.length == 1) {
				return path[0];
			}

			path = path.map(node => encodeURIComponent(node));

			return path.slice(0, -1).join('.') + '=' + path[path.length - 1];
		}).join('&');
	}

	toState() {
		let ret = {};

		this._paths.filter(path => path.length > 1).forEach(path => {
			let leading = path.slice(0, -1);
			let val = path[path.length - 1];

			let activeNode = ret;
			for(let i = 0, len = leading.length; i < len - 1; i++) {
				activeNode[path[i]] = activeNode[path[i]] || {};
				activeNode = activeNode[path[i]];
			}

			activeNode[leading[leading.length - 1]] = activeNode[leading[leading.length - 1]] || [];
			activeNode[leading[leading.length - 1]].push(val);
		});

		return ret;
	}

	_matchWith(small, big) {
		if(big.length < small.length) {
			return false;
		} 

		for(let i = 0, len = small.length; i < len; i++) {
			if(big[i] != small[i]) {
				return false;
			}
		}

		return true;
	}

	importState(state) {
		let paths = [];

		function crawl(state, path) {
			Object.keys(state).forEach(key => {
				if(state[key] instanceof Array) {
					state[key].forEach(val => {
						paths.push([].concat(path, [key, val]));
					});
				} else if(typeof state[key] == 'object') {
					crawl(state[key], [].concat(path, [key]));
				} else {
					paths.push([].concat(path, [key, state[key]]));
				}
			});
		}

		crawl(state, []);

		this._paths = this._paths.concat(paths);

		return paths;
	}
}

module.exports = Chunk;

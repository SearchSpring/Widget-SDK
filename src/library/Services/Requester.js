let m = require('mithril');
let Chunk = require('library/Utilities/Chunk');

let cache = {};

class Requester {
	constructor(defaultParams, config) {
		this._defaultParams = defaultParams;
		this._config = config;
		this._mutators = [];
	}

	request(params) {
		this._hasRequested = true;

		let urlBase = this._config.apiProtocol + this._config.apiHost + this._config.apiEndpoint;

		let urlQuery = this._getQuery(params);

		let url = urlBase + '?' + this._getQuery(this._defaultParams) + (urlQuery ? '&' + urlQuery : '');

		let promise;

		if(cache[url]) {
			promise = cache[url];
		} else {
			promise = cache[url] = m.request({ url, dataType: 'jsonp' });
		}

		let request = JSON.parse(JSON.stringify(Object.assign({}, this._defaultParams, this._asState(params))));

		let deferred = m.deferred();

		m.startComputation();

		try {
			promise.then(data => {
				data = JSON.parse(JSON.stringify(data));

				this._mutators.forEach(fn => fn(data, request));
				deferred.resolve(data);

				m.endComputation();
			}, () => {
				deferred.reject();

				m.endComputation();
			});
		} catch(e) {
			deferred.reject(e);

			m.endComputation();
		}

		return deferred.promise;
	}

	mutated(fn) {
		if(this._hasRequested) {
			throw 'Request mutators must be bound before the first request';
		}

		this._mutators.push(fn);
		return this;
	}

	_getQuery(inp) {
		if(typeof inp == 'object') {
			if(typeof inp.toQuery == 'function') {
				return inp.toQuery();
			}

			return (new Chunk(inp)).toQuery();
		}

		return inp || '';
	}

	_asState(inp) {
		if(inp && typeof inp.toState == 'function') {
			return inp.toState();
		}

		return (new Chunk(inp)).toState();
	}
}

module.exports = Requester;

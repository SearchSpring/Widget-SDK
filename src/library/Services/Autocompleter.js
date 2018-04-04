let m = require('mithril');
let Requester = require('./Requester');
let Location = require('library/Utilities/Location');
let Searcher = require('./Searcher');

class Autocompleter extends Requester {
	constructor(defaultParams, config) {
		config = Object.assign({
			apiProtocol: (window.location.protocol == "https:" ? 'https://' : 'http://'),
			apiHost: 'autocomplete2.searchspring.net',
			apiEndpoint: '/'
		}, config || {});

		super(defaultParams, config);

		this._mutators = []; // disable Requester mutator
		this._acMutators = [];

		this.searcher = new Searcher({ siteId: defaultParams.pubId });
	}

	mutated(cb) {
		this._acMutators.push(cb);

		return this;
	}

	request(params) {
		const hostConfig = window.SearchSpringWidgetSdkHostConfig ? (
			window.SearchSpringWidgetSdkHostConfig()
		) : {};

		params = this._asState(params);

		let deferred = m.deferred();

		let cb = (data, params) => {
			this._acMutators.forEach(mutator => mutator(data, params));

			deferred.resolve(data);
		};

		if(params.q || params.filter) {
			if(params.siteId) {
				// This is already set in the constructor
				delete params.siteId;
			}
			this.searcher.request(params).then(data => {
				cb(data, params);
			});
		} else {
			super.request(params, hostConfig.autocomplete || {}).then(acData => {
				if(acData.terms && acData.terms.length) {
					acData.terms = (acData.terms || [])
						.map(suggestion => suggestion.replace(/<\/?em>/g, ''))
						.map(term => {
							let ret = {
								raw: term,
								html: term.replace(new RegExp(`(${params.query})`, 'g'), '<em>$1</em>'),
							};

							ret.location = base => {
								let location = new Location(base);
								location.add('q', term);

								return location;
							};

							ret.toString = () => term;

							return ret;
						});

					let query = acData.terms[0].raw;

					this.searcher.request({ q: query }).then(searchData => {
						cb(Object.assign({}, searchData, { terms: acData.terms }), Object.assign({}, params, { q: query }));
					}, () => deferred.reject());
				} else {
					deferred.reject();
				}
			});
		}

		return deferred.promise;
	}
}

module.exports = Autocompleter;

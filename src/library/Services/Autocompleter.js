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

		this.searcher = new Searcher({ siteId: defaultParams.pubId}, { apiEndpoint: '/api/search/autocomplete.json' });
	}

	mutated(cb) {
		this._acMutators.push(cb);

		return this;
	}

	request(params) {
		params = this._asState(params);

		let deferred = m.deferred();

		let cb = (data, params) => {
			this._acMutators.forEach(mutator => mutator(data, params));

			deferred.resolve(data);
		};

		if(params.q || params.filter) {
			this.searcher.request(params).then(data => {
				cb(data, params);
			});
		} else {
			super.request(params).then(acData => {

				// TODO: Potential spot for autocomplete gate

				// if(true || (acData.terms && acData.terms.length)) {
					/*
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
					*/

					acData.terms = [];  // ignore Autocomplete query suggestions

					// let query = (acData.terms && acData.terms.length > 0) ? acData.terms[0].raw : params.query;
					let query = params.query;

					this.searcher.request({ q: query }).then(searchData => {
						cb(Object.assign({}, searchData, { terms: acData.terms }), Object.assign({}, params, { q: query }));
					}, () => deferred.reject());

				/*
				} else {
					deferred.reject();
				}
				*/
			});
		}

		return deferred.promise;
	}
}

module.exports = Autocompleter;

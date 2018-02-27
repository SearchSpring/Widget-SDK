let Location = require('library/Utilities/Location');
let Requester = require('./Requester');

let facetStates = {};

class Searcher extends Requester {
	constructor(defaultParams, config) {
		defaultParams = Object.assign({}, {
			domain: encodeURIComponent(window.location.href),
			resultsFormat: 'native'
		}, defaultParams || {});

		config = Object.assign({}, {
			apiProtocol: (window.location.protocol == "https:" ? 'https://' : 'http://'),
			apiHost: 'api.searchspring.net',
			apiEndpoint: '/api/search/search.json'
		}, config || {});

		super(defaultParams, config);

		this.mutated((data, request) => {
			facetStates[request.siteId] = facetStates[request.siteId] || {};
			let thisFacetStates = facetStates[request.siteId];

			(data.facets || []).forEach(facet => {
				thisFacetStates[facet.field] = thisFacetStates[facet.field] || {
					showAll: false,
					collapse: facet.collapse,
					range: facet.range || undefined
				};

				let state = thisFacetStates[facet.field];

				if(facet.range && state.range) {
					if(facet.range[0] < state.range[0]) {
						state.range[0] = facet.range[0];
					}

					if(facet.range[1] > state.range[1]) {
						state.range[1] = facet.range[1];
					}
				}

				facet.range = state.range;

				facet.state = state;
				delete facet.collapse;
			});
		});

		this.mutated(data => {
			(data.facets || []).filter(f => f.range).forEach(facet => {
				facet.active = facet.active || facet.range.slice();
				facet.setActive = range => {
					let location = new Location();
					location.remove('filter', facet.field);
					location.remove('page');

					location.add('filter', facet.field, 'low', range[0]);
					location.add('filter', facet.field, 'high', range[1]);

					location.go();
				};
			});
		});

		this.mutated((data, request) => {
			if(!request.sort) {
				return;
			}

			data.sorting.options.forEach(opt => {
				if(!request.sort[opt.field]) {
					return;
				}

				request.sort[opt.field].active = request.sort[opt.field] == request.sort[opt.field].direction;
			});
		});

		this.mutated(data => {
			let urlOf = function(page) {
				let location = new Location();
			
				location.remove('page');
				if(page > 1) {
					location.add('page', page);
				}

				return location.toString();
			};

			urlOf.relative = rel => urlOf(data.pagination.currentPage + rel);
			urlOf.last = () => urlOf(data.pagination.last);

			data.pagination.urlOf = urlOf;
		});

		this.mutated(data => {
			let filterSummary = data.filterSummary || [];

			filterSummary.forEach(selected => {
				selected.remove = {};
				selected.remove.location = (base, initial) => {
					let location = new Location(base, initial);

					if(selected.value != undefined) {
						if(selected.value.rangeLow != undefined && selected.value.rangeHigh != undefined) {
							location.remove('filter', selected.field, 'low', selected.value.rangeLow);
							location.remove('filter', selected.field, 'high', selected.value.rangeHigh);
						} else {
							location.remove('filter', selected.field, selected.value);
						}
					}

					return location;
				};
			});

			filterSummary.clear = {
				location(base, initial) {
					let location = new Location(base, initial);
					location.remove('filter');

					return location;
				}
			};

			data.filterSummary = filterSummary;
		});

		this.mutated((data, params) => {
			if(!data.facets) {
				return;
			}

			//data.facets = data.facets.filter(facet => {
			//	facet.values = facet.values.filter(value => {
			//		return value.active || value.count < data.pagination.totalResults;
			//	});

			//	return facet.values.length > 0;
			//});

			if(params.filter) {
				data.facets.filter(f => f.type == 'hierarchy').forEach(facet => {
					let selected = params.filter[facet.field] || [];

					if(!selected.length) {
						facet.values.forEach(v => v.level = 0);
						return;
					}

					selected = selected[0].split(facet.hierarchyDelimiter);

					facet.values.forEach(v => v.level = selected.length + 1);

					for(let i = selected.length - 1; i >= 0; i--) {
						facet.values.unshift({
							label: selected[i],
							value: selected.slice(0, i + 1),
							active: i == selected.length - 1,
							level: i + 1,
						});
					}

					facet.values.unshift({
						label: 'All',
						value: null,
						active: false,
						level: 0,
					});
				});
			}

			data.facets.forEach(facet => {
				facet.values.forEach(value => {
					value.location = (base, initial) => {
						let location = new Location(base, initial);

						location.remove('page');

						let add = location.add.bind(location, 'filter');
						let get = location.get.bind(location, 'filter');
						let remove = location.remove.bind(location, 'filter');

						if(value.type == 'range') {
							let had = get(facet.field, 'low', value.low).length
								|| get(facet.field, 'high', value.high).length;

							if(facet.multiple == 'single' && !had) {
								remove(facet.field);
							}

							if(had) {
								remove(facet.field, 'low', value.low);
							} else {
								add(facet.field, 'low', value.low);
							}
							if(had) {
								remove(facet.field, 'high', value.high);
							} else {
								add(facet.field, 'high', value.high);
							}
						} else {
							if(value.value == null) {
								remove(facet.field);
							} else {
								let prevLen = get(facet.field, value.value).length;

								if(facet.type == 'hierarchy' || (facet.multiple == 'single' && !prevLen)) {
									remove(facet.field);
								}

								if(facet.type == 'hierarchy') {
									add(facet.field, value.value);
								} else {
									if(prevLen) {
										remove(facet.field, value.value);
									} else {
										add(facet.field, value.value);
									}
								}
							}
						}

						return location;
					};
				});
			});
		});

		this.mutated(data => {
			(data.results || []).forEach(result => {
				Object.keys(result).forEach(key => {
					let textarea = document.createElement('textarea');

					textarea.innerHTML = result[key];
					result[key] = textarea.value;
				});
			});
		});
	}

	request(params) {
		const hostConfig = window.SearchSpringWidgetSdkHostConfig ? (
			window.SearchSpringWidgetSdkHostConfig()
		) : {};

		return super.request(params, hostConfig.search || {});
	}
}

module.exports = Searcher;

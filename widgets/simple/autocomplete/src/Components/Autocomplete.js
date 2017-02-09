let Autocomplete = {
	controller(attrs) {
		this.vm = Widgets.Utilities.ViewModel(function(state) {
			let autocompleter = new Widgets.Services.Autocompleter({ pubId: attrs['searchspring-id'] })
				.mutated((data, request) => data.query = request.q)
				.mutated(data => {
					(data.results || []).forEach(result => {
						result.price = Number(result.price);
						result.msrp = Number(result.msrp);
					});
				});

			let search = (chunk, keep) => {
				autocompleter.request(chunk).then(acData => {
					state(Object.assign(acData, keep || {}, { chunk }));
				}, () => {
					state({});
				});
			};

			let inputTimeout;
			attrs.input.addEventListener('input', e => {
				clearTimeout(inputTimeout);

				inputTimeout = setTimeout(() => {
					let chunk = new Widgets.Utilities.Chunk();
					chunk.add('query', e.target.value);

					search(chunk);
				}, 150);
			});

			let hoverTimeout;
			this.preview = chunk => {
				clearTimeout(hoverTimeout);

				hoverTimeout = setTimeout(() => {
					let keep = {};

					keep.terms = state().terms;

					if(chunk.get('filter').length) {
						keep.query = state().query;
						keep.facets = state().facets;
					}

					search(chunk, keep);
				}, 200);
			};

			this.cancelPreview = () => {
				clearTimeout(hoverTimeout);
			};

			this.valueActive = (facet, value) => {
				if(value.value !== undefined) {
					return state().chunk.get('filter', facet.field, value.value).length;
				} else if(value.low !== undefined && value.high !== undefined) {
					return state().chunk.get('filter', facet.field, 'low', value.low).length
						&& state().chunk.get('filter', facet.field, 'high', value.high).length;
				}

				return false;
			};

			this.isVisible = () => {
				return attrs.input.value && (state().results || []).length && (state().terms || []).length;
			};
		});
	},
	view(ctrl, attrs) {
		let { terms=[], facets=[], results=[], merchandising={}, query } = ctrl.vm.state();

		function show(bool) {
			return {
				display: bool ? 'initial' : 'none'
			};
		}

		let PreviewLink = {
			view(_, attrs, children) {
				return (
					<a {...attrs} onmousemove={ () => ctrl.vm.preview(attrs.chunk) } onmouseleave={ ctrl.vm.cancelPreview }>
						{ children }
					</a>
				);
			}
		};

		return (
			<div class="ss ac" style={{ display: ctrl.vm.isVisible() ? 'block' : 'none' }}>
				{ !ctrl.vm.isVisible() ? null : (
					<div>
						<div class={ [ 'ss-wrapper', terms.length === 0 ? 'no-terms' : '' ].join(' ') }>
							<div class="ss-terms" style={ show(terms.length) }>
								<ul>
									{terms.map(term => {
										let location = new Widgets.Utilities.Location(attrs.action);
										location.add(attrs.input.name, term.raw);

										let chunk = new Widgets.Utilities.Chunk();
										chunk.add('q', term.raw);
										// TODO: Clean this up

										return <li class={ term.raw == query ? 'active' : '' }>
											<PreviewLink href={ location.toString() } chunk={ chunk }>{ m.trust(term.html) }</PreviewLink>
										</li>;
									})}
								</ul>
							</div>

							<div class="ss-content">
								<div class="ss-facets">
									{facets.filter(f => f.values.length).filter(f => f.type != 'slider').slice(0, 3).map(facet => (
										<div id={ 'searchspring-' + facet.field } class={
											[
												'facet-container',
												{
													palette: 'palette',
													grid: 'grid'
												}[facet.type] || 'list'
											].join(' ')
										}>
											<h4>{ facet.label }</h4>

											<ul>
												{{
													grid: facet.values.slice(0, 8).map(value => (
														<li class={ ctrl.vm.valueActive(facet, value) ? 'active' : '' }>
															<PreviewLink href={ value.location({ [attrs.input.name]: query }, attrs.action).toString() } chunk={ value.location({ q: query }, attrs.action) }>
																<span class="grid-value">{ value.label }</span>
															</PreviewLink>
														</li>
													)),
													palette: facet.values.slice(0, 8).map(value => (
														<li class={ ctrl.vm.valueActive(facet, value) ? 'active' : '' }>
															<PreviewLink href={ value.location({ [attrs.input.name]: query }, attrs.action).toString() } alt={ value.label } title={ value.label } chunk={ value.location({ q: query }, attrs.action) }>
																<span style={{ 'background-color': value.label }} class="color-value"></span>
															</PreviewLink>
														</li>
													))
												}[facet.type] || facet.values.slice(0, 6).map(value => (
													<li class={ ctrl.vm.valueActive(facet, value) ? 'active' : '' }>
														<PreviewLink href={ value.location({ [attrs.input.name]: query }, attrs.action).toString() } chunk={ value.location({ q: query }, attrs.action) }>{ value.label }</PreviewLink>
													</li>
												))}
											</ul>

										</div>
									))}
									<Widgets.Components.Merchandising type="left" merchandising={ merchandising } />
								</div>

								<div class="ss-results">
									<h4>Search Results for <strong>"{ query }"</strong></h4>

									<Widgets.Components.Merchandising type="header" merchandising={ merchandising } />
									<Widgets.Components.Merchandising type="banner" merchandising={ merchandising } />

									<ul class="item-results">
										{ results.slice(0, 6).map(result => (
											<li class="item">
												<a href={ result.url } config={ Widgets.Components.config.intellisuggest(result) }>
													<div class="item-image">
														<div class="image-wrapper">
															<img key={ result.id } src={ result.thumbnailImageUrl ? result.thumbnailImageUrl : '//cdn.searchspring.net/ajax_search/img/default_image.png' } onerror="this.src='//cdn.searchspring.net/ajax_search/img/default_image.png';" alt={ result.name } title={ result.name } />
														</div>
													</div>
													<div class="item-details">
														<p class="item-name">{ result.name }</p>
														<p class="item-price">
															<span class="msrp" style={ show(result.msrp > result.price) }>${ result.msrp.toFixed(2) }</span>
															<span class={ [ 'regular', result.msrp > result.price ? 'on-sale' : '' ].join(' ') }>${ result.price.toFixed(2) }</span>
														</p>
													</div>
												</a>
											</li>
										)) }
									</ul>

									<Widgets.Components.Merchandising type="footer" merchandising={ merchandising } />
								</div>
							</div>
						</div>
					</div>
				) }
			</div>
		);
	}
};

module.exports = Autocomplete;

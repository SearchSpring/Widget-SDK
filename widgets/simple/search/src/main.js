require('styles/index.scss');

const FACET_SHORT_LEN = 10;

Widgets.register('simple/search', {
	controller(attrs) {
		this.vm = Widgets.Utilities.ViewModel(function(state) {
			let searcher = new Widgets.Services.Searcher({ siteId: attrs['searchspring-id'] })
				.mutated(data => {
					(data.results || []).forEach(result => {
						result.msrp = Number(result.msrp);
						result.price = Number(result.price);
					});
				});

			this.search = function() {
				let request = new Widgets.Utilities.Location();

				let q = request.getLast(attrs.parameter);
				if(q) {
					request.add('q', q);
					request.remove(attrs.parameter);
				}

				searcher.request(request).then(response => {
					state({ response, q });
				});
			};

			this.setSort = val => {
				let [ field, direction ] = val.split('=');

				(new Widgets.Utilities.Location()).remove('sort').add('sort', field, direction).go();
			};

			Widgets.Services.UrlWatcher.subscribe(() => this.search());
			this.search();
		});

		this.slideout = document.createElement('div');
		document.body.appendChild(this.slideout);
	},
	view(ctrl) {
		let { facets=[], results=[], merchandising={}, pagination={}, sorting={}, filterSummary=[] } = ctrl.vm.state().response || {};

		// render the slideout along with everything else
		m.render(ctrl.slideout, <FacetSlideout facets={ facets } summary={ filterSummary } merchandising={ merchandising } />);

		return results.length === 0 ? (
			<NoResults class="ss" query={ ctrl.vm.state().q } />
		) : (
			<div class="ss" config={ Widgets.Components.config.history.scroller }>
				<div>
					<Facets facets={ facets } summary={ filterSummary } merchandising={ merchandising } />

					<div class="ss-wrapper">
						<div class="ss-content">

							<div class="ss-results">
								<Widgets.Components.Merchandising type="header" merchandising={ merchandising } />

								<div class="topHeader">
									{ ctrl.vm.state().q ? (
										<h4 class="main">
											Search Results
											<span> for <strong>"{ ctrl.vm.state().q }"</strong></span>
										</h4>
									) : null }
									<div class="sort right">
										<b>Sort: </b>
										<Widgets.Components.SortBox sorting={ sorting } onchange={ m.withAttr('value', ctrl.vm.setSort) } />
									</div>
								</div>

								<Widgets.Components.Merchandising type="banner" merchandising={ merchandising } />

								<div style={{ clear: 'both' }} />
								<ul class="item-results">
									{ results.map(result => (
										<li class="item">
											<a href={ result.url }>
												<div class="item-image">
													<div class="image-wrapper">
														<img
															key={ result.id }
															src={ result.thumbnailImageUrl ? result.thumbnailImageUrl : '//cdn.searchspring.net/ajax_search/img/default_image.png' }
															onerror="this.src='//cdn.searchspring.net/ajax_search/img/default_image.png';"
															alt={ result.name }
															title={ result.name }
														/>
													</div>
												</div>
												<div class="item-details">
													<p class="item-name">{ result.name }</p>
													<p class="item-price">
														<span class="msrp" style={{ display: result.msrp > result.price ? 'block' : 'none' }}>${ result.msrp.toFixed(2) }</span>
														<span class={ [ 'regular', result.msrp > result.price ? 'on-sale' : '' ].join(' ') }>${ result.price.toFixed(2) }</span>
													</p>
												</div>
											</a>
										</li>
									)) }
								</ul>
								<div style={{ clear: 'both' }} />

								<Widgets.Components.Pagination pagination={ pagination } config={ Widgets.Components.config.history.pushState } />

								<Widgets.Components.Merchandising type="footer" merchandising={ merchandising } />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

let FilterSummary = {
	view(ctrl, attrs) {
		let { summary=[] } = attrs;
		return (
			<div>
				{ summary.length ? (
					<div class="ss-summary">
						<h4 class="facet-header">Current Filters</h4>
						<div class="values">
							<ul>
								{ summary.map(selected => (
									<li>
										<a href={ selected.remove.location().toString() } config={ Widgets.Components.config.history.pushState }>
											<b>X</b> { selected.label }
										</a>
									</li>
								)) }
								<li>
									<a href={ summary.clear.location().toString() } config={ Widgets.Components.config.history.pushState }>
										Clear All
									</a>
								</li>
							</ul>
						</div>
					</div>
				) : null }
			</div>
		);
	}
};

let Facets = {
	view(ctrl, attrs) {
		let { facets=[], merchandising={} } = attrs;
		return (
			<div class="ss-facets" style={ attrs.style || {} }>
				<FilterSummary summary={ attrs.summary }></FilterSummary>
				{ facets.map(facet => (
					<div id={ 'searchspring-' + facet.field } class={
						[
							'facet-container',
							{
								palette: 'palette',
								grid: 'grid',
								hierarchy: 'hierarchy'
							}[facet.type] || 'list'
						].join(' ')
					}>
						<h4 class="facet-header pointer" onclick={ () => facet.state.collapse = !facet.state.collapse }>
							{ facet.label }
							<span class="monospace right facet-hide-indicator">{ facet.state.collapse ? '+' : '-' }</span>
						</h4>

						{ facet.state.collapse ? null : (
							(
								facet.type == 'slider' ? (
									<div>
										<Widgets.Components.Slider
											floor={ facet.range[0] }
											ceil={ facet.range[1] }
											min={ facet.active[0] }
											max={ facet.active[1] }
											format={ (facet.format || '').split(' - ').shift() }
											onchange={ state => facet.setActive([state.min, state.max]) }
										/>
									</div>
								) : (
									<div class="facet-options">
										<ul>
											{ (facet.state.showAll ? facet.values : facet.values.slice(0, FACET_SHORT_LEN)).map(value => (
												<li class={ value.active ? 'active' : '' }>
													{{
														grid: (
															<a config={ Widgets.Components.config.history.pushState } href={ value.location().toString() }>
																<span class="grid-value">{ value.label }</span>
															</a>
														),
														palette: (
															<a config={ Widgets.Components.config.history.pushState } href={ value.location().toString() } alt={ value.label } title={ value.label }>
																<span style={{ 'background-color': value.label }} class="color-value"></span>
															</a>
														),
														hierarchy: (
															<a config={ Widgets.Components.config.history.pushState } href={ value.location().toString() }>
																{ m.trust(Array((value.level || 0) + 1).join('&nbsp;')) }
																{ value.label }
																{ value.count === undefined ? null : <span class="count"> ({ value.count })</span> }
															</a>
														)
													}[facet.type] || (
														<a config={ Widgets.Components.config.history.pushState } href={ value.location().toString() }>
															{ value.label }
															<span class="count"> ({ value.count })</span>
														</a>
													)}
												</li>
											)) }
										</ul>

										{ facet.values.length <= FACET_SHORT_LEN ? null : (
											<a class="showmore" onclick={ () => facet.state.showAll = !facet.state.showAll }>
												Show { facet.values.length - FACET_SHORT_LEN } { facet.state.showAll ? 'Less' : 'More' }
											</a>
										) }
									</div>
								)
							)
						) }

					</div>
				)) }
				<Widgets.Components.Merchandising type="left" merchandising={ merchandising } />
			</div>
		);
	}
};

let FacetSlideout = {
	controller() {
		this.vm = new Widgets.Utilities.ViewModel(function(state) {
			state({ visible: false });

			this.show = () => state({ visible: true });
			this.hide = () => state({ visible: false });
			this.toggle = () => state({ visible: !state().visible });
		});
	},
	view(ctrl, attrs) {
		let Icon = {
			view(ctrl, attrs) {
				return <div style={{ 'font-size': '2em' }}>{ m.trust(attrs.char) }</div>;
			}
		};

		return (
			<div class="ss-facet-slideout ss">
				<div class="slideoutToggle" onclick={ ctrl.vm.toggle }>
					{ ctrl.vm.state().visible ? (
						<div style={{ margin: '15px 0 0' }}>
							<Icon char="X" />
							Hide
						</div>
					) : (
						<div style={{ margin: '15px 0 0' }}>
							<Icon char="&#9776;" />
							Refine
						</div>
					) }
				</div>
				{ ctrl.vm.state().visible ? (
					<div>
						<style>{'body { overflow-y: hidden }'}</style>
						<div class="ss-facet-slideout-overlay" onclick={ ctrl.vm.hide } />
					</div>
				) : null }
				<div>
					<Facets {...attrs} style={ ctrl.vm.state().visible ? { left: 0 } : {} } />
				</div>
			</div>
		);
	}
};

let NoResults = {
	view(_, attrs) {
		return (
			<div {...attrs}>
				<h4>No results { attrs.query ? 'for "' + attrs.query + '"' : '' }</h4>
			</div>
		);
	}
};


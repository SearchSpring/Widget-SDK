let config = {
	history: {
		_supported() {
			return window.history && window.history.replaceState instanceof Function;
		},
		_addToState(obj) {
			if(config.history._supported()) {
				let newState = Object.assign({}, window.history.state || {}, obj);
				window.history.replaceState(newState, '', window.location.href);
			}
		},
		_recordScroll() {
			config.history._addToState({ widgetsScrollY: window.scrollY });
		},
		pushState(elem) {
			if(!config.history._supported()) {
				return;
			}

			if(elem.doesPushState) {
				return;
			}

			elem.doesPushState = true;

			elem.addEventListener('click', event => {
				config.history._recordScroll();
				window.history.pushState({}, '', elem.href);

				event.preventDefault();
				return false;
			});
		},
		scroller(elem) {
			if(config.history._supported()) {
				if(!window.history.state || !window.history.state.widgetsScrollY) {
					if(elem.getBoundingClientRect().top < 0) {
						window.scrollTo(0, (window.scrollY + elem.getBoundingClientRect().top) - window.document.documentElement.clientHeight / 4);
					}
					return;
				}

				window.scrollTo(0, window.history.state.widgetsScrollY);
			}
		}
	}
};

let scrollTimeout;
window.addEventListener('scroll', () => {
	clearTimeout(scrollTimeout);
	scrollTimeout = setTimeout(config.history._recordScroll, 50);
});

module.exports = config;

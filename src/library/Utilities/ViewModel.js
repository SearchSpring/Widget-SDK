let m = require('mithril');

function ViewModel(constructor) {
	let _state = {};
	let stateGetterSetter = newState => {
		if(newState) {
			_state = newState;

			/* This could be an m.render(), which could potentially shave off 20 ms or so
			 * since there would be no timeout. m.[*]Computation, however, triggers a 
			 * single redraw if many states (or other things using m.[*]Computation)
			 * occur in rapid succession. This saves some CPU load and should make it
			 * more performant on lesser machines and mobile devices.
			 *
			 * http://mithril.js.org/mithril.computation.html
			 */
			m.startComputation();
			setTimeout(() => {
				m.endComputation();
			});
		}

		return _state;
	};

	let vm = new constructor(stateGetterSetter);

	Object.keys(vm).forEach(key => {
		if(typeof vm[key] != 'function') {
			throw `Can only bind functions to "this" of ViewModel. Attempted to bind "${key}" (${typeof vm[key]})`;
		}
	});

	return Object.assign(vm, { state: () => _state });
}

module.exports = ViewModel;

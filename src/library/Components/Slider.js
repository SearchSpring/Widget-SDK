let m = require('mithril');
let sprintf = require('library/Utilities/sprintf');
let ViewModel = require('library/Utilities/ViewModel');

let listeners = {};
function subscribe(evName, cb) {
	if(!listeners[evName]) {
		listeners[evName] = [];
		document.addEventListener(evName, e => {
			listeners[evName].forEach(listener => listener(e));
		});
	}

	listeners[evName].push(cb);
}

let Slider = {
	controller(attrs) {
		if(isNaN(attrs.floor) || isNaN(attrs.ceil)) {
			throw 'Slider attributes floor and ceil must be numbers';
		}

		attrs.floor = Number(attrs.floor);
		attrs.ceil = Number(attrs.ceil);

		if(attrs.floor > attrs.ceil) {
			let temp = attrs.ceil;
			attrs.ceil = attrs.floor;
			attrs.floor = temp;
		}

		attrs.min = attrs.min || attrs.floor;
		attrs.max = attrs.max || attrs.ceil;

		if(attrs.min > attrs.max) {
			let temp = attrs.max;
			attrs.max = attrs.min;
			attrs.min = temp;
		}

		this.vm = ViewModel(function(state) {
			state({ min: attrs.min, max: attrs.max });
			this.formattedState = () => {
				return { min: format(state().min), max: format(state().max) };
			};

			let _dragging = undefined;

			let _step = () => {
				let s = Math.ceil((attrs.ceil - attrs.floor) / (_bar.rect().width / 10));
				return s;
			};

			let _bar = {};
			this.registerBarElem = elem => {
				_bar.elem = elem;
				_bar.rect = elem.getBoundingClientRect.bind(elem);
			};

			this.ready = () => _bar && _handles.min && _handles.max;

			let _handles = { min: undefined, max: undefined };
			this.registerHandle = (which, elem) => {
				_handles[which] = {
					elem: elem,
					rect: elem.getBoundingClientRect.bind(elem)
				};

				setTimeout(() => {
					let left = valToRelLeft(_bar, _handles[which], state()[which]);

					elem.style.position = 'absolute';
					elem.style.left = left + 'px';

					setInfo(_handles[which], state()[which]);
				});

				elem.addEventListener('mousedown', event => {
					_dragging = which;

					event.stopPropagation();
					event.preventDefault();
					return false;
				});
			};

			subscribe('mousemove', event => {
				if(!_dragging) {
					return;
				}
				let handle = _handles[_dragging];

				document.body.setAttribute('_dragging', true);
				handle.elem.setAttribute('_dragging', true);

				let val = mousePosToVal(_bar, handle, event.x - _bar.rect().left);

				let left = valToRelLeft(_bar, handle, val);

				handle.elem.style.position = 'absolute';
				handle.elem.style.left = left + 'px';

				setInfo(handle, val);
			});

			subscribe('mouseup', () => {
				document.body.removeAttribute('_dragging');

				if(!_dragging) {
					return;
				}

				let vals = Object.keys(_handles).map(which => {
					let handle = _handles[which];

					handle.elem.removeAttribute('_dragging');

					if(_dragging != which) {
						return state()[which];
					}

					return mousePosToVal(_bar, handle, handle.rect().left - _bar.rect().left + (handle.rect().width / 2));
				});

				vals = vals.sort((a, b) => a - b);

				state({ min: vals[0], max: vals[1] });
				if(attrs.onchange instanceof Function) {
					attrs.onchange(state());
				}
				_dragging = undefined;
			});

			function mousePosToVal(bar, handle, relPos) {
				let barInnerWidth = bar.rect().width - handle.rect().width;

				let range = attrs.ceil - attrs.floor;
				let val = attrs.floor + ((relPos / barInnerWidth) * range);

				val = Math.floor(val / _step()) * _step();

				if(val < attrs.floor) {
					val = attrs.floor;
				}

				if(val > attrs.ceil) {
					val = attrs.ceil;
				}

				return val;
			}

			function valToRelLeft(bar, handle, val) {
				let barInnerWidth = bar.rect().width - handle.rect().width;
				let left = barInnerWidth * ((val - attrs.floor) / (attrs.ceil - attrs.floor));

				return left;
			}

			function setInfo(handle, val) {
				let fromFloor = val - attrs.floor;
				let perc = fromFloor / (attrs.ceil - attrs.floor);
				
				let infoElem = handle.elem.querySelector('.info');
				if(infoElem) {
					infoElem.innerHTML = format(val);
				}

				let infoWidth = infoElem.getBoundingClientRect().width;

				infoElem.style.left = '-' + ((infoWidth - handle.rect().width) * perc) + 'px';
			}

			function format(val) {
				if(attrs.format) {
					return sprintf(attrs.format, val);
				}

				return val;
			}
		});
	},
	view(ctrl) {
		let Handle = {
			view(ctrl, attrs) {
				return (
					<div class="handle" unselectable="on" style={{ position: 'absolute' }} {...attrs} >
						<div class="inner-handle" />
						<div class="info" />
					</div>
				);
			}
		};
		
		let style = {
			position: 'relative'
		};

		return (
			<div class="ss-slider" style={ style }>
				<div class="labels">
					<div style={{ clear: 'both' }} />
					<div class="label min">{ ctrl.vm.formattedState().min }</div>
					<div class="label max">{ ctrl.vm.formattedState().max }</div>
					<div style={{ clear: 'both' }} />
				</div>
				<div class="bar" config={ ctrl.vm.registerBarElem }>
					<Handle config={ elem => ctrl.vm.registerHandle('min', elem) } />
					<Handle config={ elem => ctrl.vm.registerHandle('max', elem) } />
				</div>
			</div>
		);
	}
};

module.exports = Slider;

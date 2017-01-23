require('styles/index.scss');

let Autocomplete = require('Components/Autocomplete');
let getRelatedInput = require('Utilities/getRelatedInput');

Widgets.register('simple/autocomplete', {
	controller(attrs) {
		this.vm = Widgets.Utilities.ViewModel(function(state) {
			this.focus = focused => {
				if(state().focused != focused) {
					state({ focused });
				}
			};
		});

		this.inputElement = getRelatedInput(attrs.thisElement);

		this.inputElement.setAttribute('autocomplete', 'off');

		this.inputElement.addEventListener('focus', () => this.vm.focus(true));
		this.inputElement.addEventListener('keydown', () => this.vm.focus(true));

		this.inputElement.addEventListener('blur', () => setTimeout(() => {
			let otherInput = document.querySelector(':focus');
			if(otherInput && otherInput.tagName == 'INPUT' && otherInput != attrs.thisElement) {
				this.vm.focus(false);
			}
		}));

		document.body.addEventListener('click', () => {
			console.log('click body');
			this.vm.focus(false);
		});

		attrs.thisElement.addEventListener('click', event => {
			event.stopPropagation();
			return false;
		});
		this.inputElement.addEventListener('click', event => {
			event.stopPropagation();
			return false;
		});
	},
	view(ctrl, attrs) {
		return (
			<div style={{ display: ctrl.vm.state().focused ? 'block' : 'none' }}>
				<Autocomplete {...attrs} input={ ctrl.inputElement } action={ ctrl.inputElement.form.action } />
			</div>
		);
	}
});

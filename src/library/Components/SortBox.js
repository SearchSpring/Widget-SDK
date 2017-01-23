let m = require('mithril');

let SortBox = {
	view(_, attrs) {
		let sorting = attrs.sorting || {};
		delete attrs.sorting;

		return (
			<select {...attrs}>
				{ (sorting.options || []).map(sort => (
					<option value={ sort.field + '=' + sort.direction } selected={ sort.active }>{ sort.label }</option>
				)) }
			</select>
		);
	}
};

module.exports = SortBox;

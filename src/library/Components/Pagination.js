let m = require('mithril');

let Pagination = {
	view(ctrl, attrs) {
		attrs = attrs || {};
		let pagination = attrs.pagination;
		let page = pagination.currentPage;
		let last = pagination.totalPages;

		let inherited = Object.assign({}, attrs);
		delete inherited.pagination;

		let min = Number(attrs.min || -1);
		let max = Number(attrs.max || 1);

		let pages = [];

		if(page + min > 1) {
			pages.push(
				<span>
					<a href={ pagination.urlOf(1) } {...inherited}>1</a>
					...
				</span>
			);
		}

		for(let i = min; i <= max; i++) {
			if(i == 0) {
				pages.push(
					<span class="current"> { page } </span>
				);
			} else if(page + i > 0 && page + i <= last) {
				pages.push(
					<a href={ pagination.urlOf.relative(i) } {...inherited}>{ page + i }</a>
				);
			}
		}

		if(page < last - max) {
			pages.push(
				<span>
					...
					<a href={ pagination.urlOf(last) } {...inherited}>{ last }</a>
				</span>
			);
		}

		return (
			<div class="pagination">
				{ pages }
			</div>
		);
	}
};

module.exports = Pagination;

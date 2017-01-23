let m = require('mithril');

let Merchandising = {
	view(_, attrs) {
		let content;
		if(attrs.merchandising.content && attrs.merchandising.content[attrs.type]) {
			content = attrs.merchandising.content[attrs.type].map(merch => (
				<div style={{ clear: 'both' }}>
					{ m.trust(merch) }
				</div>
			));
		}

		return (
			<div id={ 'ss-ac-merch_' + attrs.type } class="merchandising">
				{ content }
			</div>
		);
	}
};

module.exports = Merchandising;

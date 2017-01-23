const FREQUENCY = 20;

let subscribers = [];
let endSubscribers = [];

let interval;
let pathname = window.location.pathname;
let lastQuery = window.location.search;

function start() {
	interval = setInterval(() => {
		if(pathname != window.location.pathname) {
			/* For one page apps, stop watching the url and 
			 * notify subscribers that registered an ender. */
			clearInterval(interval);
			interval = undefined;
			endSubscribers.forEach(sub => sub());
			return;
		}

		if(lastQuery != window.location.search) {
			lastQuery = window.location.search;

			subscribers.forEach(sub => sub());
		}
	}, FREQUENCY);
}

let UrlWatcher = {
	subscribe(cb, ender) {
		subscribers.push(cb);

		if(ender instanceof Function) {
			endSubscribers.push(ender);
		}

		if(!interval) {
			start();
		}
	}
};

module.exports = UrlWatcher;

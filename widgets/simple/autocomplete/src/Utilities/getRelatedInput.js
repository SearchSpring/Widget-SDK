function getRelatedInput(widgetElem) {
	// TODO: 'not' selector is not compatible with IE8
	let elems = [...document.querySelectorAll('input[type=text], input[type=search], input:not([type]), ' + widgetElem.tagName)];

	let widgetIndex = elems.indexOf(widgetElem);

	/* If there are no inputs before it, get the one after it */
	return elems[widgetIndex - (widgetIndex > 0 ? 1 : -1)];
}

module.exports = getRelatedInput;

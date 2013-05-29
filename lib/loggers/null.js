function noop() {}

var nullLogger = {
	name: 'Null',
	log: noop,
	debug: noop,
	info: noop,
	warn: noop,
	error: noop,
	fatal: noop
};

module.exports = nullLogger;
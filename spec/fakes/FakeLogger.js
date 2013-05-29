function noop() {}

function FakeLogger() {
	return {
		log: noop,
		info: noop,
		warn: noop,
		error: noop,
		fatal: noop
	};
}

module.exports = {
	Logger: FakeLogger,
	transports: { Console: noop },
	encoders: { Text: noop }
};

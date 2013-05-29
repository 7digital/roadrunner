var colors = require('colors');

function noop() {}

var consoleLogger = {
	name: 'Console',
	log: console.log,
	debug: console.debug,
	info: console.info,
	warn: console.warn,
	error: console.error,
	fatal: console.fatal,
	attach: function attach(batch) {
		var self = this;
		batch.on('starting', function () {

			batch.on('target', function (target) {
				self.log('Preparing target: %s', target.server());

				target.on('chain', function (chain) {
					chain.on('command dispatching', function (commandText) {
						self.log('\t>>>: %s', commandText);
					});

					chain.on('command complete', function (chain, output) {
						self.log('\t<<<: %j', output);
					});

					chain.on('complete', function () {
						self.log('Chain Complete');
					});
				});

				target.on('starting', function () {
					self.log('\n' + this.server() + ':');
				});

				target.on('complete', function () {
					var successMessage = this.server() + ' Complete';
					self.log(successMessage.green);
				});

			});
		});

		batch.on('complete', function () {
			// console.log('Batch Complete');
		});

		batch.on('error', function (err) {
			self.error(err.message.red);
		});
	}
};

module.exports = consoleLogger;

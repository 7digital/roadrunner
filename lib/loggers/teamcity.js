var util = require('util');
var teamcity = require('teamcity-servicemessages').formatter;

function basicLog() {
	var msg = util.format.apply(null, arguments);

	console.log(teamcity.buildMessage(msg));
}

function flowLog(flowId) {
	var args = Array.prototype.slice.call(arguments, 1);
	var msg = util.format.apply(null, args);
	console.log(teamcity.buildMessage(msg, undefined, undefined, flowId));
}

var teamCityLogger =  {
	name: 'TeamCity',
	log: basicLog,
	debug: basicLog,
	info: basicLog,
	warn: basicLog,
	error: basicLog,
	fatal: basicLog,
	attach: function attach(batch) {
		var self = this;
		batch.on('starting', function () {

			batch.on('target', function (target) {
				var flowId = target.server();

				target.on('chain', function (chain) {
					chain.on('command dispatching', function (commandText) {
						flowLog(flowId, '\t>>>: %s', commandText);
					});

					chain.on('command complete', function (chain, output) {
						flowLog(flowId, '\t<<<: %j', output);
					});

					chain.on('complete', function () {
						flowLog(flowId, 'Chain Complete');
					});
				});

				target.on('starting', function () {
					console.log(teamcity.startProgress(this.server()));
				});

				target.on('complete', function () {
					console.log(teamcity.finishProgress(this.server()));
				});

			});
		});

		batch.on('error', function (err) {
			self.error(err.message.red);
		});
	}
};

module.exports = teamCityLogger;

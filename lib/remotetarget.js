var util = require('util');
var RemoteControl = require('./remotecontrol');
var Target = require('./target');
var nullLogger = require('./loggers/null');

function RemoteTarget(opts) {
	Target.call(this, opts);
	this.opts = opts || {};
	this.isLocal = false;
	// TODO: Make RemoteControl's options match the target's options more closely
	// to avoid this left/right code
	this.rc = new RemoteControl({
		server: this.server(),
		connection: {
			host: this.opts.host,
			sshUser: this.opts.user,
			port: this.opts.port,
			sshPassword: this.opts.password,
			keyFile: this.opts.key
		}
	});
	this.dispatcher = this.rc.exec.bind(this.rc);
}

util.inherits(RemoteTarget, Target);

RemoteTarget.prototype.server = function server() {
	return this.opts.host;
};

RemoteTarget.prototype.run = function run(callback) {
	var self = this;
	this.emit('starting');
	this.rc.connect(function connected(err) {
		if (err) {
			self.emit('error', err);
			return callback(err);
		}
		self.runChains(function disconnect(err) {
			if (err) {
				self.emit('error', err);
				return callback(err);
			}

			self.rc.disconnect();
			self.emit('complete');
			callback();
		});
	});
};

module.exports = RemoteTarget;

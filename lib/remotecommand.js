var ReadableStream = require('text-streams').ReadableStream;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Adapter for ssh streams to make the API consistent with node core
// streams and child process
function RemoteCommand(sshStream) {
	this.sshStream = sshStream;
	this.stdout = new ReadableStream();
	this.stderr = new ReadableStream();
	this.attachEvents();
}

util.inherits(RemoteCommand, EventEmitter);

RemoteCommand.prototype.attachEvents = function attachEvents() {
	var self = this;

	this.sshStream.on('data', function (data, extended) {
		if (extended === 'stderr') {
			self.stderr.emit('data', data);
		} else {
			self.stdout.emit('data', data);
		}
	});

	this.sshStream.on('end', function () {
		self.stderr.emit('end');
		self.stdout.emit('end');
	});

	this.sshStream.on('close', function () {
		self.stderr.emit('close');
		self.stdout.emit('close');
	});

	this.sshStream.on('exit', function (exitCode, signal) {
		self.emit('exit', { code: exitCode, signal: signal });
	});
};

module.exports = RemoteCommand;

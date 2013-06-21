var Connection = require('ssh2');
var fs = require('fs');
var path = require('path');
var underscore = require('underscore');
var RemoteCommand = require('./remotecommand');
var AccumulatingStream = require('text-streams').AccumulatingStream;
var LineStream = require('text-streams').LineStream;
var Chain = require('chain-of-command');
var defaultCommandConfig = {
	sshPort: 22,
};

function RemoteControl(context) {
	var self = this;
	var connectionConfig = context.connection || {};

	this.config = underscore.defaults(connectionConfig, defaultCommandConfig);
	this.config.server = context.server;
}

RemoteControl.prototype.connect = function connect(connectedCallback) {
	if (this.connected === true) {
		return;
	}

	this.connection = new Connection();
	this.setupConnectionEventHandlers(connectedCallback);
	this.connection.connect({
		host: this.config.server,
		port: this.config.sshPort,
		username: this.config.sshUser,
		password: this.config.sshPassword,
		privateKey: require('fs').readFileSync(this.config.keyFile)
	});
};

RemoteControl.prototype.disconnect = function disconnect(callback) {
	if (!this.connected) {
		return;
	}

	this.connection.end();
	this.connection = null;
};

RemoteControl.prototype.exec = function exec(command, callback) {
	var self = this;

	if (!this.connected) {
		process.nextTick(function notConnected() {
			callback(new Error("Not connected to remote host"));
		});
	}

	var commandContext = {
		callback: callback,
		command: command
	};

	this.dispatchCommands(commandContext);
};

RemoteControl.prototype.setupConnectionEventHandlers = function setupConnectionEventHandlers(connectedCallback) {
	var self = this;
	var connectionReadyHandler = this.onConnectionReady.bind(this, connectedCallback.bind(this));

	this.connection.on('ready', connectionReadyHandler);
	this.connection.on('error', function onConnectionError(err) {
		connectedCallback.call(self, err);
	});
	this.connection.on('end', function onConnectionEnd() {
		self.connected = false;
	});
	this.connection.on('close', function onConnectionEnd() {
		self.connected = false;
	});
};

RemoteControl.prototype.onConnectionReady = function onConnectionReady(connectedCallback) {
	var self = this;
	this.connected = true;

	function createChain(commandString) {
		return new Chain(commandString, self.exec.bind(self));
	}

	function uploadFile(fileName, callback) {
		self.connection.sftp(function (err, sftp) {
			sftp.on('end', function onConnectionError() {
				self.connected = false;
				return callback();
			});
			var remoteFileStream = sftp.createWriteStream(fileName, { flags: 'w' });
			var localFileStream = fs.createReadStream(fileName);

			remoteFileStream.on('error', function (err) {
				return callback(err);
			});

			remoteFileStream.on('close', function () {
				return callback();
			});

			return localFileStream.pipe(remoteFileStream);
		});
	}

	connectedCallback(null, createChain /* aka run in the connect callback */, uploadFile /* aka upload in the connect callback */);
};

RemoteControl.prototype.dispatchCommands = function dispatchCommands(commandContext) {
	this.connection.exec(commandContext.command, this.handleStreams.bind(this, commandContext));
};

RemoteControl.prototype.handleStreams = function handleStreams(commandContext, err, stream) {
	var self = this;
	var exitStatus;
	var remoteCommand = new RemoteCommand(stream);
	var outLineStream = new LineStream();
	var outAccumulator = new AccumulatingStream();
	var errLineStream = new LineStream();
	var errAccumulator = new AccumulatingStream();

	if (err) {
		commandContext.callback(err);
	}

	remoteCommand.on('exit', function handleRemoteCommandexit(details) {
		exitStatus = details;
	});

	remoteCommand.stdout.pipe(outLineStream)
			.pipe(outAccumulator);

	remoteCommand.stderr.pipe(errLineStream)
			.pipe(errAccumulator);

	stream.on('close', function () {
		var result = {
			output: outAccumulator.getData(),
			errors: errAccumulator.getData()
		};
		if (exitStatus.code === 0) {
			commandContext.callback(null, result.output);
		} else {
			commandContext.callback(exitStatus, result);
		}
	});
};

module.exports = RemoteControl;

var Connection = require('ssh2');
var fs = require('fs');
var path = require('path');
var underscore = require('underscore');
var RemoteCommand = require('./remotecommand');
var AccumulatingStream = require('text-streams').AccumulatingStream;
var LineStream = require('text-streams').LineStream;
var Chain = require('chain-of-command');
var defaultCommandConfig = {
	sshPort: 22
};

function RemoteControl(context) {
	var self = this;
	var connectionConfig = context.connection || {};

	this.config = underscore.defaults(connectionConfig, defaultCommandConfig);
	this.config.server = context.server;
}

RemoteControl.prototype.connect = function connect(
		connectedCallback, connectionLostCallback) {

	if (this.connected === true) {
		return;
	}

	this.connection = new Connection();
	this.setupConnectionEventHandlers(connectedCallback, connectionLostCallback);

	var key;
	if (this.config.keyFile) {
		key = require('fs').readFileSync(this.config.keyFile);
	}

	this.connection.connect({
		host: this.config.server,
		port: this.config.sshPort,
		username: this.config.sshUser,
		password: this.config.sshPassword,
		privateKey: key
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
		return callback(new Error("Not connected to remote host"));
	}

	var commandContext = {
		callback: callback,
		command: command
	};

	this.dispatchCommands(commandContext);
};

RemoteControl.prototype.setupConnectionEventHandlers = function setupConnectionEventHandlers(connectedCallback, connectionLostCallback) {
	var self = this;

	this.connection.on('ready', function onConnectionReady() {
		self.connected = true;
		connectedCallback();
	});
	this.connection.on('error', function onConnectionError(err) {
		if (self.connected) {
			self.connected = false;
			connectionLostCallback(err);
		} else {
			connectedCallback(err);
		}
	});
	this.connection.on('end', function onConnectionEnd() {
		self.connected = false;
	});
	this.connection.on('close', function onConnectionEnd() {
		self.connected = false;
	});
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
		return commandContext.callback(err);
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
			return commandContext.callback(null, result.output);
		} else {
			var err = new Error('Remote command returned status ' +
				exitStatus.code + ':\n' + result.errors);

			return commandContext.callback(err);
		}
	});
};

module.exports = RemoteControl;

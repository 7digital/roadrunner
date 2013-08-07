var EventEmitter = require('events').EventEmitter;
var util = require('util');
var async = require('async');
var localDispatcher = require('./localdispatcher');
var Chain = require('chain-of-command');

function Target(opts) {
	EventEmitter.call(this);
	this.opts = opts || {};
	this.dispatcher = localDispatcher();
	this.isLocal = true;
	if (this.opts.server) {
		this.isLocal = false;
	}
	this.chains = [];
}

util.inherits(Target, EventEmitter);

Target.prototype.local = function local() {
	return this.isLocal;
};

Target.prototype.server = function server() {
	return this.opts.server || 'localhost';
};

Target.prototype.config = function config() {
	return this.opts.config;
};

Target.prototype.addChain = function addChain(firstCommand) {
	var chain = new Chain(firstCommand, this.dispatcher);
	this.chains.push(chain);
	this.emit('chain', chain);
	return chain;
};

Target.prototype.prepare = function prepare() {
	var config = this.config();
	global.server = this.server();
	Object.defineProperty(global, "config", {
		get: function getConfig() {
			if (config) {
				return config;
			} else {
				throw new Error('A script expected config, but none was supplied');
			}
		},
		enumerable: false,
		configurable: true
	});
	global.chain = global.$ = this.addChain.bind(this);
};

Target.prototype.destroy = function destroy() {
	delete global.server;
	delete global.config;
	delete global.chain;
	delete global.$;
};

Target.prototype.runChains = function runChains(callback) {
	async.eachSeries(this.chains, function runChain(chain, cb) {
		this.emit('chain starting', chain);

		chain.on('error', function (err) {
			this.emit('error', err);
			cb(err);
		}.bind(this));

		chain.andFinally(function chainCompleted(err) {
			if (err) {
				return cb(err);
			}

			this.emit('chain complete');
			return cb();
		}.bind(this));


	}.bind(this), callback);
};

Target.prototype.run = function run(callback) {
	this.emit('starting');
	this.runChains(function targetCompleted(err) {
		if (err) {
			return callback(err);
		}

		this.emit('complete');
		return callback();
	}.bind(this));
};

module.exports = Target;

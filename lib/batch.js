var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var async = require('async');
var Target = require('./target');
var RemoteTarget = require('../lib/remotetarget');

function Batch(opts) {
	EventEmitter.call(this, opts);
	this.opts = opts || {};
	this.scripts = this.opts.scripts || [];
	this.targets = [];
}

util.inherits(Batch, EventEmitter);

Batch.prototype.config = function config() {
	return this.opts.config;
};

Batch.prototype.local = function local() {
	return (!this.opts.connections || this.opts.connections.length === 0 ||
		this.opts.local);
};

Batch.prototype.parallel = function parallel() {
	return !!this.opts.parallel;
};

Batch.prototype.addScript = function addScript(scriptPath) {
	this.scripts.push(scriptPath);
};

Batch.prototype.addTarget = function addTarget(target) {
	this.targets.push(target);
	this.emit('target', target);
};

Batch.prototype.loadScripts = function loadScripts() {
	this.scripts.forEach(function loadScript(script) {
		this.targets.forEach(function addChainsToTarget(target) {
			var scriptPath = path.resolve(process.cwd(), script);
			target.prepare();
			require(scriptPath);
			delete require.cache[scriptPath];
			target.destroy();
		});
	}, this);
};

Batch.prototype.createTargets = function createTargets() {
	if (this.local() === true) {
		this.addTarget(new Target({
			config: this.config()
		}));
	}
	if (this.opts.connections) {
		this.opts.connections.forEach(function createTarget(conn) {
			var targetOpts = {};
			targetOpts = conn;
			targetOpts.config = this.config();
			this.addTarget(new RemoteTarget(targetOpts));
		}, this);
	}
};

Batch.prototype.run = function run(callback) {
	var asyncMode = this.parallel() ? 'each' : 'eachSeries';
	this.emit('starting');
	this.createTargets();
	this.loadScripts();

	async[asyncMode](this.targets, function runTarget(target, cb) {
		target.run(cb);
	}, function runAllTargets(err) {
		if (err) {
			return this.emit('error', err);
		}

		this.emit('complete');
		callback(err);
	}.bind(this));
};

module.exports = Batch;

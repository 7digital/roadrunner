/* global $ */
/* global server */
/* global config */
var assert = require('assert');
var Target = require('../lib/target');

describe('Target', function () {

	describe('ctor', function () {

		it('should perform initialisation', function () {
			var fakeConfig = { foo: 'bar' };
			var target = new Target({
				config: fakeConfig
			});

			assert.ok(target.dispatcher);
			assert.ok(target.chains);
			assert.ok(target.opts);
			assert.equal(target.config(), fakeConfig);
		});
	});

	describe('addChain', function () {

		it('should add a chain', function () {
			var target = new Target();
			var command = 'echo hello';

			target.addChain(command);

			assert.equal(target.chains.length, 1);
		});

		it('should emit a chain event', function (done) {
			var target = new Target();
			var command = 'echo hello';

			target.on('chain', function (chain) {
				assert.strictEqual(chain.first.commandText, command);
				done();
			});
			target.addChain(command);
		});

	});

	describe('prepare', function () {

		it('should add properties to the global', function () {
			function fakeDispatcher(command, callback) {
				callback();
			}
			var fakeConfig = { foo: 'bar' };
			var target = new Target({ server: 'foo.acme.com', config: fakeConfig });
			target.dispatcher =  fakeDispatcher;
			target.prepare();
			assert.equal(global.server, 'foo.acme.com');
			assert.deepEqual(global.config, fakeConfig);
			$('echo ' + server + ' ' + config.foo);
			assert.equal(target.dispatcher, target.chains[0].dispatcher);
			assert.equal(target.chains.length, 1);
			assert.equal(target.chains[0].commands[0].commandText, 'echo foo.acme.com bar');
		});

		it('should error when config is undefined and accessed in a script', function () {
			function fakeDispatcher(command, callback) {
				callback();
			}
			var target = new Target({ server: 'foo.acme.com', config: undefined });
			target.dispatcher =  fakeDispatcher;
			target.prepare();
			assert.equal(global.server, 'foo.acme.com');
			try {
				$('echo ' + server + ' ' + config.foo);
			} catch (err) {
				assert.ok(err);
				return assert.equal(err.message, 'A script expected config, but none was supplied');
			}

			assert.fail("Should have thrown an error with the expected message");
		});

	});

	describe('destroy', function () {

		it('should undefine the globals', function () {
			global.server = 'oh noes';
			global.config = { not: 'ok' };
			global.chain = 'fail';
			global.$ = 'fail';
			var target = new Target();
			target.destroy();
			assert.ok(!global.server);
			assert.ok(!global.config);
			assert.ok(!global.chain);
			assert.ok(!global.$);
		});

	});

	describe('run', function () {

		it('should set each chain\'s dispatcher', function (done) {
			function fakeDispatcher(command, callback) {
				callback();
			}
			var target = new Target();
			target.dispatcher =  fakeDispatcher;

			target.addChain('echo hello');
			target.addChain('echo world');

			target.run(function () {
				assert.ok(target.chains[0].commands[0].finished);
				assert.ok(target.chains[1].commands[0].finished);
				done();
			});
		});

		it('should emit a starting event', function (done) {
			var target = new Target();
			var startingEmitted = false;
			target.dispatcher =  function fakeDispatcher(command, callback) {
				callback();
			};

			target.addChain('echo hello');
			target.addChain('echo world');

			target.on('starting', function () {
				startingEmitted = true;
			});

			target.run(function () {
				assert.ok(startingEmitted);
				done();
			});
		});

		it('should emit chain starting events', function (done) {
			var chainStartingEvents = [];
			var target = new Target();
			target.dispatcher = function fakeDispatcher(command, callback) {
				callback();
			};

			target.addChain('echo hello');
			target.addChain('echo world');

			target.on('chain starting', function (chain) {
				chainStartingEvents.push(chain);
			});

			target.run(function () {
				assert.equal(chainStartingEvents.length, 2);
				done();
			});
		});

		it('should emit chain complete events', function (done) {
			var chainCompleteEvents = 0;
			var target = new Target();
			target.dispatcher = function fakeDispatcher(command, callback) {
				callback();
			};

			target.addChain('echo hello');
			target.addChain('echo world');

			target.on('chain complete', function (chain) {
				chainCompleteEvents++;
			});

			target.run(function () {
				assert.equal(chainCompleteEvents, 2);
				done();
			});
		});

		it('should emit complete events', function (done) {
			var completeEventEmitted = false;
			var target = new Target();
			target.dispatcher = function fakeDispatcher(command, callback) {
				callback();
			};

			target.addChain('echo hello');

			target.on('complete', function (chain) {
				completeEventEmitted = true;
			});

			target.run(function () {
				assert.ok(completeEventEmitted);
				done();
			});
		});

		it('should emit error when chain errors', function (done) {
			var errorEventEmitted = false;
			var target = new Target();

			target.dispatcher = function fakeDispatcher(command, callback) {
				callback(new Error('command errored!'));
			};

			target.addChain("echo hello");

			target.on('error', function (err) {
				errorEventEmitted = true;
				assert.equal(err.message, 'command errored!');
				done();
			});

			target.run(function () {});
		});

		it('should callback error when chain errors', function (done) {
			var errorEventEmitted = false;
			var target = new Target();
			var errorMessage = 'command errored!';

			target.dispatcher = function fakeDispatcher(command, callback) {
				callback(new Error(errorMessage));
			};

			target.addChain('echo hello');

			target.on('error', function () {}); // prevent throwing when error event not bound to

			target.run(function (err) {
				assert.equal(err.message, errorMessage);
				done();
			});
		});
	});

	describe('context properties', function () {

		it('should return true', function () {
			var target = new Target();
			assert.ok(target.local());
		});

		it('should return the server', function () {
			var target = new Target({ server: 'foo.acme.com' });
			assert.ok(!target.local());
			assert.equal(target.server(), 'foo.acme.com');
		});

		it('should set the server to localhost when local', function () {
			var target = new Target();
			assert.equal(target.server(), 'localhost');
		});

		it('should return the config', function () {
			var fakeConfig = { foo: 'bar' };
			var target = new Target({ config: fakeConfig });
			assert.deepEqual(target.config(), fakeConfig);
		});

	});

});

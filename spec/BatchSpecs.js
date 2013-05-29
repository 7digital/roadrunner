var assert = require('assert');
var path = require('path');
var Batch = require('../lib/batch');
var Target = require('../lib/target');
var RemoteTarget = require('../lib/remotetarget');

describe('Batch', function () {

	describe('ctor', function () {

		it('should perform initialisation', function () {
			var fakeConfig = { foo: 'bar' };
			var batch = new Batch({
				config: fakeConfig,
				local: false,
				connections: []
			});

			assert.ok(batch.scripts);
			assert.ok(batch.targets);
			assert.ok(batch.opts);
			assert.ok(!batch.parallel());
			assert.deepEqual(batch.config(), fakeConfig);
		});

	});

	describe('local', function () {

		it('should be true when local flag is passed and connections are supplied', function () {
			var batch = new Batch({
				local: true,
				connections: [ { host: 'foo.acme.com'} ]
			});

			assert.ok(batch.local());
		});

		it('should be true when no connections are passed and no flag', function () {
			var batch = new Batch({
				connections: [ ]
			});

			assert.ok(batch.local());
		});

		it('should be false when connections are passed and no flag', function () {
			var batch = new Batch({
				connections: [ { host: 'foo.acme.com' } ]
			});

			assert.ok(!batch.local());
		});
	});

	describe('addScript', function () {

		it('should add scripts', function () {
			var batch = new Batch({});

			batch.addScript(path.resolve(__dirname, 'fixtures/singlechain.js'));
			batch.addScript(path.resolve(__dirname, 'fixtures/twochains.js'));

			assert.equal(batch.scripts.length, 2);
		});

	});

	describe('addTarget', function () {

		it('should add target', function () {
			var batch = new Batch({});
			var target = new Target();

			batch.addTarget(target);

			assert.equal(batch.targets.length, 1);
		});

	});

	describe('createTargets', function () {

		it('should add a local target if specified', function () {
			var fakeConfig = { foo: 'bar' };
			var batch = new Batch({ local: true, config: fakeConfig });
			batch.createTargets();
			assert.equal(batch.targets.length, 1);
			assert.equal(batch.targets[0].config(), fakeConfig);
		});

		it('should emit target event for each target created', function () {
			var targetEvents = 0;
			var batch = new Batch({ local: true, connections: [{
					host: 'abc.xyz.com',
					user: 'test',
					key: '/home/user/foo/.ssh/id_pub.rsa'
				}, {
					host: 'def.xyz.com',
					user: 'test',
					key: '/home/user/foo/.ssh/id_pub.rsa'
				}]
			});
			batch.on('target', function (target) {
				targetEvents++;
			});
			batch.createTargets();
			assert.equal(targetEvents, 3);
		});

		it('should load each remote target', function () {
			var fakeConfig = { foo: 'bar' };
			var batch = new Batch({
					local: false,
					config: fakeConfig,
					connections: [ {
							host: 'abc.xyz.com',
							user: 'test',
							key: '/home/user/foo/.ssh/id_pub.rsa'
						}, {
							host: 'def.xyz.com',
							user: 'test',
							key: '/home/user/foo/.ssh/id_pub.rsa'
						} ]
					});
			batch.createTargets();
			assert.equal(batch.targets.length, 2, ' did not add 2 targets');
			assert.equal(batch.targets[0].constructor, RemoteTarget,
						'first target was not remote target');
			assert.equal(batch.targets[1].constructor, RemoteTarget,
						'first target was not remote target');
			assert.equal(batch.targets[0].config(), fakeConfig);
			assert.equal(batch.targets[1].config(), fakeConfig);
		});

	});

	describe('run', function () {

		it('should create all the targets and add all the scripts', function (done) {
			var batch = new Batch();
			var createWasCalled, loadWasCalled;
			batch.createTargets = function createTargets() {
				createWasCalled = true;
			};
			batch.loadScripts = function loadScripts() {
				loadWasCalled = true;
			};

			batch.run(function batchComplete(err) {
				assert.ok(createWasCalled);
				assert.ok(loadWasCalled);
				done();
			});
		});

		it('should emit a starting event', function (done) {
			var startingEmitted = false;
			var batch = new Batch({
				connections: []
			});

			batch.on('starting', function () {
				startingEmitted = true;
			});

			batch.run(function batchComplete() {
				assert.ok(startingEmitted);
				done();
			});
		});

		it('should emit a starting event', function (done) {
			var completeEmitted = false;
			var batch = new Batch({
				connections: []
			});

			batch.on('complete', function () {
				completeEmitted = true;
			});

			batch.run(function batchComplete() {
				assert.ok(completeEmitted);
				done();
			});
		});
	});

});

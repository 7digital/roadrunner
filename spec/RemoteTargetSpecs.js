var assert = require('assert');
var RemoteTarget = require('../lib/remotetarget');

describe('RemoteTarget', function () {

	describe('ctor', function () {

		it('should perform initialisation', function () {
			var target = new RemoteTarget();

			assert.ok(target.opts);
			assert.ok(target.rc);
		});

	});

	describe('server', function () {

		it('should return the conenction host', function () {
			var target = new RemoteTarget({
					host: 'abc.xyz.com',
					user: 'test',
					key: '/home/user/foo/.ssh/id_pub.rsa'
				});

			assert.equal(target.server(), 'abc.xyz.com');
		});

	});

	describe('local', function () {

		it('should return false', function () {
			var target = new RemoteTarget({});
			assert.ok(!target.local());
		});

	});

});

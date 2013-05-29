var assert = require('assert');
var path = require('path');
var ConfigLoader = require('../lib/config-loader');

describe('Config Loader', function () {
	
	it('load should return the config', function (done) {
		var configPath = path.join(__dirname, 'fixtures/valid.yml');
		var config = new ConfigLoader(configPath);

		config.load(function (err, config) {
			if (err) {
				done(err);
			}
			
			assert.ok(config);
			assert.equal(config.mimeTypes[0].extension, '.woff', 'Did not find mimetype in parsed config');
			done();
		});
	});

});
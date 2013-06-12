var util = require('util');
var assert = require('assert');
var SandboxedModule = require('sandboxed-module');

describe('Options', function () {
	var validArguments = [
		'--script',
		'--logger',
		'--help',
		'--parallel',
		'--config',
		'--connections'
	];

	it('should show help text', function () {
		var options = require('../lib/options');
		assert.notEqual(options.showHelp, '', 'showHelp() returned an empty string');
	});

	it('should describe all arguments', function () {
		var options = require('../lib/options');
		var help = options.showHelp();

		validArguments.forEach(function (argument) {
			assert.notEqual(help.indexOf(argument.slice(2)), -1,
				util.format('Couldn\'t find %s in help message', argument));
		});
	});

	it('should allow only help option', function () {
		var options = SandboxedModule.require('../lib/options', {
			globals: { 'process': { 'argv': [ 'node', 'bin\\iis-deployer.js', '--help' ] } }
		});

		options.parse();
		assert.ok(true);
	});

	it('should require a script', function () {
		var options = SandboxedModule.require('../lib/options', {
			globals: { 'process': { 'argv': [ 'node', 'bin\\iis-deployer.js' ] } }
		});

		try {
			options.parse();
		} catch (e) {
			return assert.ok(e);
		}

		assert.fail('Should have thrown');
	});

	it('should allow a custom logger', function () {
		var options = SandboxedModule.require('../lib/options', {
			globals: { 'process': { 'argv': [ 'node', 'bin\\iis-deployer.js', '--connections', 'foo.yml', '--logger', 'teamcity', 'foo' ] } }
		});

		var opts = options.parse();
		assert.equal(opts.logger, 'teamcity');
	});

	it('should parse scripts', function () {
		var options = SandboxedModule.require('../lib/options', {
			globals: { 'process': { 'argv': [
				'node',
				'bin\\iis-deployer.js',
				'./foo.js',
				'--config', 'foo'
			] } }
		});

		options.parse();
		assert.ok(true);
	});

	it('should fail when required arguments are not specified', function () {
		var requiredArguments = [
			'--deployid'
		];

		requiredArguments.forEach(function checkForExceptionWithArgumentMissing(argument, i) {
			var args = requiredArguments.slice(0);
			args.splice(i, 1);
			var fakeArguments = [
				'node',
				'bin\\iis-deployer.js',
				'--script', './foo.js'
			].concat(args);

			var options = SandboxedModule.require('../lib/options', {
				globals: { 'process': { 'argv': fakeArguments } }
			});

			try {
				options.parse();
			} catch (e) {
				return assert.notEqual(e, undefined);
			}

			assert.fail();
		});
	});
});

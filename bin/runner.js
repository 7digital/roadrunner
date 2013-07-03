#! /usr/bin/env node

var path = require('path');
var optionParser = require('../lib/options');
var ConfigLoader = require('../lib/config-loader');
var Batch = require('../lib/batch');
var options = optionParser.parse();
var contexts;
var logger;

try {
	logger = require('../lib/loggers/' + options.logger);
} catch (err) {
	logger = require('../lib/loggers/console');
}

logger.log(optionParser.banner);

if (options.help) {
	console.log(optionParser.showHelp());
	process.exit(0);
}

var batchOptions = {
	parallel: options.parallel,
	scripts: options.scripts,
	connections: options.connections ?
		new ConfigLoader(path.resolve(process.cwd(), options.connections)).loadSync().servers :
		undefined,
	config: options.config ?
		new ConfigLoader(path.resolve(process.cwd(), options.config)).loadSync() :
		undefined
};

var batch = new Batch(batchOptions);
logger.attach(batch);
batch.run(function batchComplete(err) {
	if (err) {
		if (/Error/.test(err.toString())) {
			logger.error(err.message);
		}

		logger.log(err);
	}

	logger.log('done');
});

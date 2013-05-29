var optimist = require('optimist');
var util = require('util');
var banner =
"                                           __           \n" +
"  __ _  ___ ___ ___    __ _  ___ ___ ___  / /           \n" +
" /  ' \\/ -_) -_) _ \\  /  ' \\/ -_) -_) _ \\/_/        \n" +
"/_/_/_/\\__/\\__/ .__/ /_/_/_/\\__/\\__/ .__(_)         \n" +
"             /_/                  /_/                   \n";
optimist
	.usage('Run scripts locally or over ssh or a combination of the two')
	.describe('config', 'The path to a yaml file that contains script configuration settings')
	.describe('connections', 'The path to a yaml file that contains ssh connection settings')
	.describe('parallel', 'Run your scripts on the targets in parallel')
	.describe('logger', 'A logger to use for formatting program output')
	.describe('help', 'Display this help');

function parse() {
	var passedArguments = optimist.parse(process.argv);

	if (passedArguments.help) {
		return passedArguments;
	}

	// Get the scripts
	// remove node and the script name
	passedArguments._.shift();
	passedArguments._.shift();
	if (!passedArguments._ || passedArguments._.length === 0) {
		throw new Error('You must specify the path to the scripts to run');
	} else {
		passedArguments.scripts = passedArguments._;
	}

	return passedArguments;
}

module.exports = {
	banner: banner,
	parse: parse,
	showHelp: optimist.help
};

var execute = require('child_process').exec;

module.exports = function createLocalExecutor() {
	return function localExec(command, callback) {
		execute(command, function commandCompleted(err, stdout, stderr) {
			var errorString = stderr ? stderr.toString() : '';
			if (err) {
				return callback(err);
			}

			if (errorString !== '') {
				return callback(errorString);
			}

			callback(null, stdout.toString());
		});
	};
};

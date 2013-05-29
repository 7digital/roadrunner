var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

function ConfigLoader(yamlPath) {
	this.yamlPath = path.resolve(process.cwd(), yamlPath);
}

ConfigLoader.prototype.load = function load(callback) {
	var self = this;

	fs.readFile(this.yamlPath, function parseContents(err, yamlBuffer) {
		if (err) {
			callback(err);
			return;
		}

		try {
			var parsedConfig = yaml.load(yamlBuffer.toString());
			callback(null, parsedConfig);
		} catch (e) {
			callback(e);
		}
	});
};

ConfigLoader.prototype.loadSync = function loadSync() {
	var self = this;
	var yamlstring = fs.readFileSync(this.yamlPath).toString();
	var parsedConfig = yaml.load(yamlstring);
	return parsedConfig;
};

module.exports = ConfigLoader;
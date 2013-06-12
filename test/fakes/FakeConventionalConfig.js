var	yamlConfig = {
		packages : ['C:\\'],
		bindings : [ '*:80:www.acme.com' ],
		environment: 'uat',
		locations: {},
		website: { siteName: 'www.acme.com' }
};

['ftpDropDirectory', 'stagingDirectory',
 'websiteDirectory'].forEach(function addProperty(prop) {
	yamlConfig.locations[prop] = '';

});

module.exports = yamlConfig;
function FakeConfigLoader(name){
	this.name = name;
}

FakeConfigLoader.prototype.loadSync = function() {
	if (this.name === 'test.yml') {
		return {};
	} else if (this.name === 'empty.yml') {
		return {
			ssh: {},
			servers: [ ]
		};
	} else if (this.name === 'connections.yml') {
		return {
			ssh: {},
			servers: [ 'server1.acme.com', 'server2.acme.com' ]
		};
	}

	throw new Error('fail');
};

module.exports = FakeConfigLoader;
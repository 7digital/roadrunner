var connectionsConfig ={
		ssh : {
			port : 22,
			deployUser: 'me',
			deployKeyFilePath : 'c:\\'
		},
		servers: [
			'server1.acme.com',
			'server2.acme.com'
		]
};

module.exports = connectionsConfig;
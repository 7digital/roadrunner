function createFakeHttp(fakeResponse) {
	var fakeHttp = {
		
		getCalls: [],

		get: function(options, callback){
			var getArgs = Array.prototype.slice.call(arguments);
			this.getCalls.push(getArgs);
			process.nextTick(function () {
				callback(fakeResponse);
			});
		}

	};

	return fakeHttp;

}

module.exports = createFakeHttp;
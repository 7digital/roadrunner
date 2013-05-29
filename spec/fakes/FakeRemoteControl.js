var fakeCommandPromise = {
	and: function(command) {
		return this;
	},
	then: function(command) {
		return this;
	},
	andFinally:function(callback) {
		process.nextTick(callback);
	}
};

function fakeCommandRunner(command) {
	return fakeCommandPromise;
}

function remoteControl(config){
	remoteControl.configPassed = config;

	return {
		connect : function(callback){
			process.nextTick(function() {
				var boundCallback = (callback).bind({
					disconnect: function() {}
				});

				boundCallback(null, fakeCommandRunner);
			});
		}
	};
}

module.exports = remoteControl;
module.exports = function (grunt) {
	grunt.initConfig({
		jshint: {
			files: [
				'Gruntfile.js',
				'index.js',
				'lib/**/*.js',
				'test/**/*.js',
				'!test/fakes/*.js',
				'!test/fixtures/*.js',
				'bin/**'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		simplemocha: {
			all: {
				src: 'test/*.js',
				options: {
					globals: [ 'chain', '$' ],
					ignoreleaks: true,
					ui: 'bdd',
					reporter: 'spec'
				}
			}
		},
		watch: {
			files: [ '**/*.js' ],
			tasks: [ 'jshint', 'simplemocha' ]
		}
	});


	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-notify');

	grunt.registerTask('default', [ 'jshint', 'simplemocha' ]);
};

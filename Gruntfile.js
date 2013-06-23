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
					globals: [ 'chain', '$', 'config', 'server' ],
					ignoreleaks: true,
					ui: 'bdd',
					reporter: 'spec'
				}
			}
		},
		complexity: {
			generic: {
				src: ['lib/**/*.js' ],
				options: {
					errorsOnly: false, // show only maintainability errors
					cyclomatic: 5,
					halstead: 15,
					maintainability: 100
				}
			}
		},
		watch: {
			files: [ '**/*.js' ],
			tasks: [ 'jshint', 'simplemocha', 'complexity' ]
		}
	});


	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-complexity');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-notify');

	grunt.registerTask('default', [ 'jshint', 'simplemocha', 'complexity' ]);
};

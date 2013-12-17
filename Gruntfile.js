var fs = require('fs');

module.exports = function configureTasks(grunt) {
	var allFiles = [ '*.js', 'lib/**/*.js', 'test/**/*.js', 'bin/*.js' ];
	var sourceFiles = [ 'lib/**/*.js' ];
	var testFiles = [ 'test/*.js' ];

	grunt.initConfig({
		jsvalidate: {
			files: [ 'lib/**/*.js' ]
		},
		jshint: {
			files: allFiles.concat([
				'!test/fakes/*.js',
				'!test/fixtures/*.js'
			]),
			options: {
				jshintrc: '.jshintrc'
			}
		},
		simplemocha: {
			all: {
				src: testFiles,
				options: {
					// simplemocha doesn't appear to ignore leaks regardless
					// of the config
					globals: [ 'chain', '$', 'config', 'server' ],
					ignoreleaks: true,
					ui: 'bdd',
					reporter: 'spec'
				}
			}
		},
		complexity: {
			all: {
				src: sourceFiles,
				options: {
					errorsOnly: false,
					cyclomatic: 5,
					halstead: 15,
					maintainability: 100
				}
			}
		},
		watch: {
			files: allFiles,
			tasks: [ 'jshint', 'simplemocha', 'complexity' ]
		}
	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('default', [
		'jsvalidate',
		'jshint',
		'simplemocha',
		'complexity'
	]);

	grunt.registerTask('setupdev', function installGitHooks() {
		fs.writeFileSync('.git/hooks/pre-commit', 'grunt');
		fs.chmodSync('.git/hooks/pre-commit', '755');
	});
};

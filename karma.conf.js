var webpack = require('webpack');

var webpackConfig = require('./gulpfile.webpack.js')();

module.exports = function(config) {
	config.set({
		
		browsers: ['PhantomJS'],

		// you can define custom flags
		customLaunchers: {
			'PhantomJS_custom': {
				base: 'PhantomJS',
				options: {
					windowName: 'my-window',
					settings: {
						webSecurityEnabled: false
					},
				},
				flags: ['--load-images=true'],
				debug: true
			}
		},

		logLevel: config.LOG_ERROR,

		phantomjsLauncher: {
			exitOnResourceError: true
		},
		frameworks: ['jasmine'],
		files: [
			'node_modules/babel-polyfill/dist/polyfill.js',
			'src/*.test.js',
			'src/**/*.test.js',
			'widgets/**/*.test.js',
		],
		preprocessors: {
			'src/*.test.js': ['webpack'],
			'src/**/*.test.js': ['webpack'],
			'widgets/**/*.test.js': ['webpack'],
		},
		webpack: {
			module: webpackConfig.module
		},
		plugins: [
			'karma-jasmine',
			'karma-phantomjs-launcher',
			'karma-webpack'
		]
	});
};

'use strict';

let path = require('path');

function getWebpackConf(_path) {
	_path = _path || '.';

	return {
		resolve: {
			root: path.resolve('./' + _path + '/src'),
			extensions: ['', '.js']
		},
		plugins: [
		],
		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'babel',
					query: {
						presets: ['es2015'],
						plugins: [
							['transform-react-jsx', { pragma: 'm' }]
						]
					},
				},
				{
					test: /\.js$/, 
					loader: "eslint-loader", 
					exclude: [ /node_modules/, /.test.js$/ ]
				},
				{
					test: /\.scss$/,
					exclude: /node_modules/,
					loaders: ['style', 'css', 'sass']
				},
				{
					test: /\.html$/,
					exclude: /node_modules/,
					loaders: ['html']
				},
			]
		},
		eslint: {
			configFile: "./.eslintrc"
		},
		stats: {
			color: false
		}
	}
}

module.exports = getWebpackConf;

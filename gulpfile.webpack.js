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
						plugins: [
							['transform-react-jsx', { pragma: 'm' }],
							['transform-es2015-arrow-functions'],
							['transform-es2015-block-scoped-functions'],
							['transform-es2015-block-scoping'],
							['transform-es2015-classes'],
							// ['transform-es2015-object-super'],
							['transform-es2015-destructuring'],
							['transform-es2015-parameters'],
							['transform-es2015-shorthand-properties'],
							['transform-es2015-spread'],
							['transform-es2015-template-literals'],
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

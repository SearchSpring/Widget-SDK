'use strict';

require('colors');

let changed = require('gulp-changed');
let extract = require('gulp-livereload-mithril');
let fs = require('fs');
let gap = require('gulp-append-prepend');
let getWebpackConf = require('./gulpfile.webpack.js');
let gls = require('gulp-live-server');
let glob = require('glob');
let gulp = require('gulp');
let httpServer = require('http-server');
let open = require('open');
let webpack = require('webpack-stream');

const DEV_DIST_PATH = 'dev-dist';
const PROD_DIST_PATH = 'dist';

function doOnce(cb) {
	let first = true;

	return function(elseCb) {
		if(first) {
			cb();
		} else {
			elseCb();
		}
		first = false;
	}
}

function getCore(cb) {
	let config = getWebpackConf();
	config.output = {
		filename: 'widgets.js'
	};

	cb(config);
}

function watchCoreWithLiveReload(onbuild) {
	getCore(config => {
		function buildWithLiveReload() {
			onbuild(gulp.src('src/main.js')
				.pipe(webpack(config))
				.pipe(gap.appendText('var livereload=document.createElement("script");livereload.src="http://localhost:35729/livereload.js";document.head.appendChild(livereload);\n'))
				.pipe(gulp.dest(DEV_DIST_PATH)));
		}

		buildWithLiveReload();
		gulp.watch([ 'src/*', 'src/**/*' ], buildWithLiveReload);
	});
}

function getWidgets(cb) {
	glob('widgets/**/main.js', function(err, files) {
		files.forEach(file => {
			let path = file.replace(/\/src\/main\.js$/, '');
			let moduleName = path.split('/').slice(-1)[0];

			try {
				let config = getWebpackConf(path);
				config.module.loaders.push({
					test: /\.js/,
					loader: 'webpack-append',
					query: 'var Widgets = SearchSpring.Widgets, m = Widgets.Utilities.m;'
				});
				config.output = {
					filename: 'widget.js'
				};

				cb(file, path, config);
			} catch(e) {
				console.log(e);
				return;
			}
		});
	});
}

function watchWidgetsWithLiveReload(onbuild) {
	getWidgets(function(file, path, config) {
		function buildWithLiveReload() {
			onbuild(gulp.src(file)
				.pipe(webpack(config))
				.pipe(gap.appendText('var st8less=document.createElement("script");st8less.src="/' +  DEV_DIST_PATH + '/' + path + '/st8less.js";document.head.appendChild(st8less);\n'))
				.pipe(extract({
					inject: false
				}))
				.pipe(changed(DEV_DIST_PATH + '/' + path, {
					hasChanged: changed.compareSha1Digest
				}))
				.pipe(gulp.dest(DEV_DIST_PATH + '/' + path)));
		}

		buildWithLiveReload();
		gulp.watch([ path + '/src/*', path + '/src/**/*' ], buildWithLiveReload);
	});
}

function runTests(done) {
	var Server = require('karma').Server;

	return new Server({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();
}

gulp.task('test', function(done) {
	runTests(done);
});

gulp.task('build/widgets', function() {
	getWidgets(function(file, path, config) {
		gulp.src(file)
			.pipe(webpack(config))
			.pipe(gulp.dest(PROD_DIST_PATH + '/' + path));
	});
});

gulp.task('build/core', function() {
	getCore(config => {
		gulp.src('src/main.js')
			.pipe(webpack(config))
			.pipe(gulp.dest(PROD_DIST_PATH));
	});
});

gulp.task('build', function() {
	runTests(function(failed) {
		if(failed != 0) {
			return;
		}

		gulp.start('build/core');
		gulp.start('build/widgets');
	});
});

gulp.task('develop', function() {
	let portfinder = require('portfinder');
	portfinder.basePort = 8080;
	portfinder.getPort((err, port) => {
		if(err) {
			throw err;
		}

		let server = httpServer.createServer({
			root: __dirname,
			showDir: true,
			autoIndex: true
		});

		server.listen(port, '0.0.0.0', function() {
			let liveReloadServer = gls.static('/', 3000);
			liveReloadServer.start();

			watchCoreWithLiveReload(function(stream) {
				stream.pipe(liveReloadServer.notify());
			});

			watchWidgetsWithLiveReload(function(stream) {
				stream.pipe(liveReloadServer.notify());
			});

			// TODO: Open browser after widgets and core have built once
			let previewPage = 'http://localhost:' + port + '/examples';
			open(previewPage, function(err) {
				if(err) {
					throw err;
				}
			});

			gulp.start('test');
			gulp.watch('src/*', [ 'test' ]);
			gulp.watch('src/**/*', [ 'test' ]);
			gulp.watch('widgets/**/*', [ 'test' ]);
		});
	});
});



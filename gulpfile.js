var gulp = require('gulp'),
    sass = require('gulp-sass')(require('sass')),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require('browserify'),
  	uglifyify = require('uglifyify'),
    source = require('vinyl-source-stream'),
  	buffer = require('vinyl-buffer');

var paths = {
	scripts: {
		root: 'src/js/ahrriss.js',
		sources: 'src/js/*.js',
		destination: {
			folder: 'deploy/js',
			name: 'ahrriss.js'
		}
	},
	sass: {
		root: 'src/sass/cerberus.scss',
		sources:  'src/sass/**/*.scss',
		destination: 'deploy/css'
	}
};


////// SASS

function sassCompile(srcPath, destPath) {
	gulp.src(srcPath)
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}))
		// .pipe(sass({outputStyle: 'compact'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(destPath));
};

gulp.task('Sass-Compile', function(done) {
	sassCompile(paths.sass.root, paths.sass.destination);
  done();
});

gulp.task('Sass-Watch', function() {
  gulp.watch(paths.sass.sources, gulp.series('Sass-Compile'));
});




////// JAVASCRIPT

gulp.task('JavaScript-Bundle', function() {
	// Grabs the application.js file
  return browserify(paths.scripts.root)
    .transform('uglifyify')
    .bundle()
    .pipe(source(paths.scripts.destination.name))
  	.pipe(buffer())
    .pipe(gulp.dest(paths.scripts.destination.folder));
})

gulp.task('JavaScript-Watch', function() {
	gulp.watch(paths.scripts.sources, gulp.series('JavaScript-Bundle'));
});



////// WATCH and BUILD

gulp.task('build', gulp.parallel('Sass-Compile', 'JavaScript-Bundle'));

gulp.task('default', gulp.series('build', gulp.parallel('Sass-Watch', 'JavaScript-Watch')));

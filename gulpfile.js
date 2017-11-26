var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require('browserify'),
  	uglify = require('gulp-uglify'),
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

gulp.task('Sass-Compile', function() {
	sassCompile(paths.sass.root, paths.sass.destination);
});

gulp.task('Sass-Watch', function() {
	gulp.watch(paths.sass.sources, ['Sass-Compile']);
});




////// JAVASCRIPT

gulp.task('JavaScript-Bundle', function() {
	// Grabs the application.js file
  return browserify(paths.scripts.root)
    .bundle()
    .pipe(source(paths.scripts.destination.name))
  	.pipe(buffer())
  	.pipe(uglify())
    .pipe(gulp.dest(paths.scripts.destination.folder));
})

gulp.task('JavaScript-Watch', function() {
	gulp.watch(paths.scripts.sources, ['JavaScript-Bundle']);
});

gulp.task('build', ['Sass-Compile', 'JavaScript-Bundle']);

gulp.task('default', ['build', 'Sass-Watch', 'JavaScript-Watch']);

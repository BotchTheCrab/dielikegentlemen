var gulp = require('gulp');
var sass = require('gulp-sass');

var sassSrcPath = 'src/sass/**/*.scss';

gulp.task('styles', function() {
    gulp.src(sassSrcPath)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css/'))
});

//Watch task
gulp.task('default',function() {
    gulp.watch(sassSrcPath,['styles']);
});

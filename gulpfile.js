var gulp = require('gulp');
var shell = require('gulp-shell');
gulp.task('build', shell.task([
  './build.sh'
]));
gulp.task('watch', function() {
  gulp.watch('./doc/md/*.md', ['build']);
});

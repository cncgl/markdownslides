var gulp = require('gulp');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var glob = require('glob');
var path = require('path');
var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var execSync = require('child_process').execSync;
var spawn = require('child_process').spawn;
var reveal = require('gulp-reveal');
var phantom = require('gulp-phantom');

gulp.task('init', function(callback) {
  var wait_max = 2;
  var wait_count = 0;
  function onEnd() {
    if(wait_max === ++wait_count) {
      callback();
    }
  }

  gulp.src('src/*.md')
    .pipe(replace(/###*/g, '##'))
    .pipe(replace(/##\\#/g, '###'))
    .pipe(rename(function(path) {
      path.basename += "-to-slides";
    }))
    .pipe(gulp.dest('build'))
    .on('end', function() { onEnd(); });

  gulp.src('src/*.md')
    .pipe(replace(/% !\[/g, '!\['))
    .pipe(replace(/ \(I\)/g, ''))
    .pipe(replace(/.*\(I.*/g, ''))
    .pipe(replace(/.*\(V.*/g, ''))
    .pipe(replace(/.*\(X.*/g, ''))
    .pipe(replace(/!\[/g, '<div style="text-align:center">!\['))
    .pipe(replace(/.png\)$/g, '.png)<\/div>\n'))
    .pipe(replace(/.jpg\)$/g, '.jpg)<\/div>\n'))
    .pipe(replace(/.gif\)$/g, '.gif)<\/div>\n'))
    .pipe(rename(function(path) {
      path.basename += "-to-book";
    }))
    .pipe(gulp.dest('build'))
    .on('end', function() { onEnd(); });
});

gulp.task('build', ['init'], function() {
  glob('build/*.md', function(er, files) {
    for(var i=0; i<files.length; i++) {
      console.log(path.parse(files[i]).name);
      var input = path.parse(files[i]).name;
      if ( input.indexOf('-to-slides') < 0 ) continue;

      input = input.replace(/-to-slides/, '');
      console.log('convert:' + input);

      // reveal.js スライド
      console.log('generating reveal slides');
      execFile('pandoc',
        ['-w', 'revealjs', '--template', './templates/reveal-slides-template.html',
          '--number-sections', '--email-obfuscation=none',
          '-o', 'build/' + input + '-reveal-slides.html',
          'build/' + input + '-to-slides.md']);

      // deck.js スライド
      console.log('generating deck slides');
      execFile('pandoc',
        ['-w', 'dzslides', '--template', './templates/deck-slides-template.html',
          '--number-sections', '--email-obfuscation=none',
          '-o', 'build/' + input + '-deck-slides.html',
          'build/' + input + '-to-slides.md']);

      // REVEAL.js のPDF
      console.log('generating reveal pdf');
      execFile('./node_modules/.bin/phantomjs',
        ['./node_modules/reveal.js/plugin/print-pdf/print-pdf.js',
          'build/readme-reveal-slides.html?print-pdf',
          'build/' + input + '-reveal-slides.pdf']);
    }
  });
});

gulp.task('watch', function() {
  gutlp.watch('doc/md/*.md', ['build']);
});

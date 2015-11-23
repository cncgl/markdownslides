var gulp = require('gulp');
//var markdown = require('gulp-markdown');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
//var exec = require('gulp-exec');
var glob = require('glob');
var path = require('path');
var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var execSync = require('child_process').execSync;
var spawn = require('child_process').spawn;
//var pandoc = require('gulp-pandoc');
var reveal = require('gulp-reveal');
var phantom = require('gulp-phantom');
//var Q = require('q');

gulp.task('init', function(callback) {
//  var deferred = Q.defer();
  var wait_max = 2;
  var wait_count = 0;
  function onEnd() {
    if(wait_max === ++wait_count) {
      callback();
    }
  }

  gulp.src('doc/md/*.md')
    .pipe(replace(/###*/g, '##'))
    .pipe(replace(/##\\#/g, '###'))
    .pipe(rename(function(path) {
      path.basename += "-to-slides";
    }))
    .pipe(gulp.dest('doc/export'))
    .on('end', function() { onEnd(); });

  gulp.src('doc/md/*.md')
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
    .pipe(gulp.dest('doc/export'))
    .on('end', function() { onEnd(); });

//  return deferred.promise;
});

gulp.task('build', ['init'], function() {
  // gulp.src('./doc/export/readme.md')
  //  .pipe(exec('pandoc -w revealjs -f markdown --template ./templates/reveal-slides-template.html --number-sections --email-obfuscation=none -o ./doc/export/<%=file.basebane %>.html'))
  //  ;

//  gulp.src('doc/export/readme.md')
//    .pipe(pandoc({
      // from: 'markdown',
      // to: 'revealjs',
      // ext: '.html',
//      args: [
//        '-w', 'revealjs',
//        '--template', 'templates/reveal-slides-template.html',
//        '--number-sections', '--email-obfuscation=none'
//      ]
//    }));

//    .pipe(gulp.dest('doc/export'));
//  gulp.src('doc/export/readme-to-slides.md')
//    .pipe(
    glob('doc/export/*.md', function(er, files) {
      //console.log(files);
      for(var i=0; i<files.length; i++) {
        console.log(path.parse(files[i]).name);
        var input = path.parse(files[i]).name;
        if ( input.indexOf('-to-slides') < 0 ) continue;

        input = input.replace(/-to-slides/, '');
        console.log('convert:' + input);

        // reveal.js スライド
        execFile('pandoc',
          ['-w', 'revealjs', '--template', 'templates/reveal-slides-template.html',
            '--number-sections', '--email-obfuscation=none',
            '-o', 'doc/export/' + input + '-reveal-slides.html',
            'doc/export/' + input + '-to-slides.md']);

        // deck.js スライド
        execFile('pandoc',
          ['-w', 'dzslides', '--template', 'templates/deck-slides-template.html',
            '--number-sections', '--email-obfuscation=none',
            '-o', 'doc/export/' + input + '-deck-slides.html',
            'doc/export/' + input + '-to-slides.md']);

        // REVEAL.js のPDF
        execFile('./node_modules/.bin/phantomjs',
          ['./node_modules/reveal.js/plugin/print-pdf/print-pdf.js',
            'doc/export/readme-to-slides.html?print-pdf',
            'doc/export/' + input + '-reveal-slides.pdf']);
      }
    });


//    .pipe(pandoc({
//      from: 'markdown',
//      to: 'revealjs',
//      ext: '.html',
//      args: [
//        '-w', 'revealjs',
//        '--template', 'templates/reveal-slides-template.html',
//        '--number-sections', '--email-obfuscation=none'
//      ]
//    }));
//  .pipe(gulp.dest('doc/export'));
//   .pipe(markdown())
//   .pipe(reveal())
//   .pipe(gulp.dest('doc/export'));
});

gulp.task('watch', function() {
  gutlp.watch('doc/md/*.md', ['build']);
});

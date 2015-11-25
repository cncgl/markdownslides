var gulp = require('gulp');
var browserSync = require('browser-sync');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var glob = require('glob');
var path = require('path');
var spawn = require('child_process').spawn;
var pwd = require('process').cwd();
var download = require('gulp-downloader');
var unzip = require('gulp-unzip');

gulp.task('download', function(callback) {
  var wait_max = 3, wait_count =0;
  function onEnd() {
    if(wait_max === ++wait_count) {
      callback();
    }
  }
  download('https://github.com/imakewebthings/deck.js/archive/master.zip')
    .pipe(unzip())
    .pipe(gulp.dest('lib'))
    .on('end', function() { onEnd(); });
  download('https://github.com/markahon/deck.search.js/archive/master.zip')
    .pipe(unzip())
    .pipe(gulp.dest('lib'))
    .on('end', function() { onEnd(); });
  download('https://github.com/mikeharris100/deck.js-transition-cube/archive/master.zip')
    .pipe(unzip())
    .pipe(gulp.dest('lib'))
    .on('end', function() { onEnd(); });
});

gulp.task('init', ['download'], function(callback) {
  var wait_max = 2, wait_count = 0;
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
    .pipe(replace(/\.png\)/g, '.png)<\/div>\n'))
    .pipe(replace(/\.jpg\)/g, '.jpg)<\/div>\n'))
    .pipe(replace(/\.gif\)/g, '.gif)<\/div>\n'))
    .pipe(rename(function(path) {
      path.basename += "-to-book";
    }))
    .pipe(gulp.dest('build'))
    .on('end', function() { onEnd(); });
});

gulp.task('build', ['init'], function() {
  glob('build/*.md', function(er, files) {
    for(var i=0; i<files.length; i++) {
      var input = path.parse(files[i]).name, src, output;

      // slides
      if ( input.indexOf('-to-slides') >= 0 ) {
        input = input.replace(/-to-slides/, '');
        src = 'build/' + input + '-to-slides.md';

        // reveal.js slides
        var taskA = function() {
          return new Promise(function(resolve, reject) {
            output = 'build/' + input + '-reveal-slides.html';
            console.log('generating reveal slides: ' + output);
            spawn('pandoc',
              ['-w', 'revealjs', '--template', './templates/reveal-slides-template.html',
                '--number-sections', '--email-obfuscation=none',
                '-o', output, src])
              .on('exit', function() {
                console.log('done: reveal slides');
                resolve();
              });
          });
        };
        var taskB = function() {
          return new Promise(function(resolve, reject) {
            output = 'build/' + input + '-reveal-slides.html';
            gulp.src(output)
              .pipe(replace('h1>', 'h2>'))
              .pipe(replace('><h2', '><h1'))
              .pipe(replace('/h2><', '/h1><'))
              .pipe(gulp.dest('build'))
              .on('end', function() {
                console.log('done: reveal slides adjust');
                resolve();
              });
          })
        };

        // deck.js slides
        var taskC = function() {
          return new Promise(function(resolve, reject) {
            output = 'build/' + input + '-deck-slides.html';
            console.log('generating deck slides: ' + output);
            spawn('pandoc',
              ['-w', 'dzslides', '--template', './templates/deck-slides-template.html',
                '--number-sections', '--email-obfuscation=none',
                '-o', output, src])
              .on('exit', function() {
                console.log('done: deck slides');
                resolve();
              });
          });
        };

        var taskD = function() {
          return new Promise(function(resolve, reject) {
            output = 'build/' + input + '-deck-slides.html';
            gulp.src(output)
              .pipe(replace('h1>', 'h2>'))
              .pipe(replace('><h2', '><h1'))
              .pipe(replace('/h2><', '/h1><'))
              .pipe(gulp.dest('build'))
              .on('end', function() {
                console.log('done: deck slides adjust');
                resolve();
              });
          });
        };

        // PDF of reveal.js
        var taskE = function() {
          return new Promise(function(resolve, reject) {
            output = 'build/' + input + '-reveal-slides.pdf';
            console.log('generating reveal pdf: ' + output);
            spawn('./node_modules/.bin/phantomjs',
              ['./node_modules/reveal.js/plugin/print-pdf/print-pdf.js',
                'build/readme-reveal-slides.html?print-pdf', output],
              { cwd: pwd })
              .on('exit', function() {
                console.log('done: reveal pdf');
                resolve();
              });
          });
        };

        taskA().then(taskB).then(taskC).then(taskD).then(taskE);
      }
      // publish
      else if (input.indexOf('-to-book') >= 0 ) {
        input = input.replace(/-to-book/, '');
        src = 'build/' + input + '-to-book.md';

        // HTML
        output = 'build/' + input + '.html';
        console.log('generating HTML: ' + output);
        spawn('pandoc',
          ['-w', 'html5', '--template', './templates/html-template.html',
            '--number-sections', '--email-obfuscation=none',
            '--toc', '--highlight-style=tango',
            '-o', output, src]);

        // docx : need to change directory in order to get image.
        src = input + '-to-book.md';
        output = input + '.docx';
        console.log('generating docx: build/' + output);
        spawn('pandoc',
          ['-w', 'docx',
            '--number-sections', '--toc', '--chapters',
            '-o', output, src],
          { cwd: pwd+'/build' });

        // odt : need to change directory in order to get image.
        output = input + '.odt';
        console.log('generating odt: build/' + output);
        spawn('pandoc',
          ['-w', 'odt',
            '--number-sections', '--toc', '--chapters',
            '-o', output, src],
          { cwd: pwd+'/build' });
      }
    }
  });
});

gulp.task('browser-sync', function() {
  browserSync({ server: { baseDir: './' }});
});

gulp.task('watch', ['build', 'browser-sync'], function() {
  gulp.watch('src/*.md', ['build']);
  gulp.watch('build/*.html').on('change', browserSync.reload);
});

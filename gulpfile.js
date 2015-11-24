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
var pwd = require('process').cwd();

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
      // console.log(path.parse(files[i]).name);
      var input = path.parse(files[i]).name, src, output;

      // スライド
      if ( input.indexOf('-to-slides') >= 0 ) {
        input = input.replace(/-to-slides/, '');
        src = 'build/' + input + '-to-slides.md';

        // reveal.js スライド
        output = 'build/' + input + '-reveal-slides.html';
        console.log('generating reveal slides: ' + output);
        spawn('pandoc',
          ['-w', 'revealjs', '--template', './templates/reveal-slides-template.html',
            '--number-sections', '--email-obfuscation=none',
            '-o', output, src]);

        // deck.js スライド
        output = 'build/' + input + '-deck-slides.html';
        console.log('generating deck slides: ' + output);
        spawn('pandoc',
          ['-w', 'dzslides', '--template', './templates/deck-slides-template.html',
            '--number-sections', '--email-obfuscation=none',
            '-o', output, src]);

        // REVEAL.js のPDF
        output = 'build/' + input + '-reveal-slides.pdf';
        console.log('generating reveal pdf: ' + output);
        spawn('./node_modules/.bin/phantomjs',
          ['./node_modules/reveal.js/plugin/print-pdf/print-pdf.js',
            'build/readme-reveal-slides.html?print-pdf', output],
          { cwd: pwd });
      }
      // 出版
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

        // docx docx と odt はディレクトリを変えないと画像が取得できない。
        src = input + '-to-book.md';
        output = input + '.docx';
        console.log('generating docx: build/' + output);
        spawn('pandoc',
          ['-w', 'docx',
            '--number-sections', '--table-of-contents', '--chapters',
            '-o', output, src],
          { cwd: pwd+'/build' });

        // odt
        output = input + '.odt';
        console.log('generating odt: build/' + output);
        spawn('pandoc',
          ['-w', 'odt',
            '--number-sections', '--table-of-contents', '--chapters',
            '-o', output, src],
          { cwd: pwd+'/build' });

        // pdf ... pdflatex が必要なので保留
        // console.log('generating pdf:' + pwd);
        // spawn('pandoc',
        //  [ '--number-sections', '--table-of-contents', '--chapters',
        //    '-o', input + '.pdf',
        //    input + '-to-book.md'],
        //  { cwd: pwd+'/build' });
      }
    }
  });
});

gulp.task('watch', function() {
  gutlp.watch('doc/md/*.md', ['build']);
});

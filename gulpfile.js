const gulp = require('gulp'),
  connect = require('gulp-connect'),
  protractor = require('gulp-protractor');

gulp.task('test', ['webdriver_update'], function () {
  connect.server({
    root: __dirname
  });

  function close() {
    connect.serverClose();
  }

  return gulp.src('test/test.js')
    .pipe(protractor.protractor({
      configFile: 'test/protractor.conf.js'
    }))
    .on('end', close)
    .on('error', close);
});

gulp.task('webdriver_update', protractor.webdriver_update);

gulp.task('default', ['test']);

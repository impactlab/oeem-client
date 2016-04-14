var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');

var path = {
  HTML: [ './templates/base.html'],
  ENTRY_POINTS: [
    'dashboard/static/dashboard/js/src/main.jsx',
  ],
  OUT: 'main.js',
  DEST: 'dashboard/static/dashboard/js/build',
};

gulp.task('watch', function() {

  var watcher = watchify(browserify({
    entries: path.ENTRY_POINTS,
    transform: [reactify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }));

  return watcher.on('update', function () {
    watcher.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST))
      console.log('Updated');
  })
    .bundle()
    .pipe(source(path.OUT))
    .pipe(gulp.dest(path.DEST));
});

gulp.task('build:production', function() {

  var b = browserify({
    entries: path.ENTRY_POINTS,
    transform: [reactify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  });

  b.bundle()
    .on('error', function(err) { console.error(err); this.emit('end'); })
    .pipe(source(path.OUT))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(path.DEST));
});

gulp.task('default', ['watch']);

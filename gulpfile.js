"use strict";
// Generated on 2019-05-04 using generator-leaflet 0.0.17

var gulp = require("gulp");
var open = require("open");

// Load plugins
var $ = require("gulp-load-plugins")();

// Styles
const styles = function () {
  return (
    gulp
      .src(["app/resources/css/*.css"])
      // .pipe($.autoprefixer('last 1 version'))
      .pipe(gulp.dest("app/styles"))
      .pipe($.size())
  );
};

// Scripts
const scripts = function () {
  return (
    gulp
      .src(["app/resources/js/*.js"])
      // .pipe($.jshint('.jshintrc'))
      // .pipe($.jshint.reporter('default'))
      .pipe(gulp.dest("app/scripts"))
      .pipe($.size())
  );
};

// GeoStyles
const geostyles = function () {
  return (
    gulp
      .src(["app/resources/geostyles/*.json"])
      // .pipe($.jshint('.jshintrc'))
      // .pipe($.jshint.reporter('default'))
      .pipe(gulp.dest("app/geostyles"))
      .pipe(gulp.dest("dist/geostyles"))
      .pipe($.size())
  );
};

// GeoData
const geodata = function () {
    return (
      gulp
        .src(["app/geodata/*"])
        // .pipe($.jshint('.jshintrc'))
        // .pipe($.jshint.reporter('default'))
        .pipe(gulp.dest("app/geodata"))
        .pipe(gulp.dest("dist/geodata"))
        .pipe($.size())
    );
  };

// HTML=
const html = function () {
  var jsFilter = $.filter("app/scripts/*.js", { restore: true });
  var cssFilter = $.filter("app/styles/*.css", { restore: true });
  // var geoStyleFilter = $.filter('app/geostyles/*.json');

  const assets = $.useref.assets();

  return (
    gulp
      .src("app/*.html")
      .pipe(assets)
      .pipe(jsFilter)
      .pipe($.uglify())
      .pipe(jsFilter.restore)
      .pipe(cssFilter)
      .pipe($.csso())
      .pipe(cssFilter.restore)
      // .pipe(geoStyleFilter)
      // .pipe(geoStyleFilter.restore())
      .pipe(assets.restore())
      .pipe($.useref())
      .pipe(gulp.dest("dist"))
      .pipe($.size())
  );
};

// Images
const images = function () {
  return gulp
    .src(["app/resources/images/*", "app/lib/images/*", "app/images/*"])
    .pipe(gulp.dest("dist/images"))
    .pipe($.size());
};

// Clean
const clean = function () {
  return gulp
    .src(
      [
        "dist",
        "app/styles",
        "app/scripts",
        "app/geostyles",
      ],
      { read: false, allowEmpty: true }
    )
    .pipe($.clean());
};

// Connect
const connect = function () {
  $.connect.server({
    root: "app",
    port: 9000,
    livereload: true,
  });
};

const reload = function () {
  return gulp
    .src([
      "app/*.html",
      "app/resources/css/*.css",
      "app/resources/js/*.js",
      "app/resources/images/*",
      "app/resources/geostyles/*",
    ])
    .pipe($.connect.reload());
};

// Open
const serve = function () {
  open("http://localhost:9000");
};

// Watch
const registerWatch = function () {
  // Watch for changes in `app` folder
  gulp.watch(
    [
      "app/*.html",
      "app/resources/css/*.css",
      "app/resources/js/*.js",
      "app/resources/images/*",
      "app/resources/geostyles/*",
    ],
    {
        ignoreInitial: true
    },
    reload
  );

  // Watch .css files
  gulp.watch("app/resources/css/*.css", styles);

  // Watch .js files
  gulp.watch("app/resources/js/*.js", scripts);

  // Watch .json files
  gulp.watch("app/resources/geostyles/*.json", geostyles);

  // Watch image files
  gulp.watch("app/resources/images/*", images);
};

const build = gulp.series(styles, scripts, geostyles, geodata, html, images);

exports.build = build;
exports.clean = clean;
exports.watch = gulp.parallel(connect, serve, registerWatch);
exports.default = gulp.series(clean, build);

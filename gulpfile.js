'use strict';
// Generated on 2019-05-04 using generator-leaflet 0.0.17

var gulp = require('gulp');
var open = require('open');
var wiredep = require('wiredep').stream;

// Load plugins
var $ = require('gulp-load-plugins')();

// Styles
gulp.task('styles', function () {
    return gulp.src(['app/resources/css/*.css'])
        // .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('app/styles'))
        .pipe($.size());
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['app/resources/js/*.js'])
        // .pipe($.jshint('.jshintrc'))
        // .pipe($.jshint.reporter('default'))
        .pipe(gulp.dest('app/scripts'))
        .pipe($.size());
});

// GeoStyles
gulp.task('geostyles', function () {
    return gulp.src(['app/resources/geostyle/*.json'])
        // .pipe($.jshint('.jshintrc'))
        // .pipe($.jshint.reporter('default'))
        .pipe(gulp.dest('app/geostyles'))
        .pipe(gulp.dest('dist/geostyle'))
        .pipe($.size());
});

// HTML
gulp.task('html', ['styles', 'scripts', 'geostyles'], function () {
    var jsFilter = $.filter('app/scripts/*.js');
    var cssFilter = $.filter('app/styles/*.css');
    // var geoStyleFilter = $.filter('app/geostyle/*.json');

    return gulp.src('app/*.html')
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        // .pipe(geoStyleFilter)
        // .pipe(geoStyleFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src([
    		'app/resources/images/*',
            'app/lib/images/*',
            'app/images/*'])
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Clean
gulp.task('clean', function () {
    return gulp.src(['dist/styles', 'dist/scripts', 'dist/images', 'app/styles', 'app/scripts', 'app/geostyles'], { read: false }).pipe($.clean());
});

// Build
gulp.task('build', ['html', 'images']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Connect
gulp.task('connect', function(){
    $.connect.server({
        root: 'app',
        port: 9000,
        livereload: true
    });
});

// Open
gulp.task('serve', ['connect'], function() {
  open("http://localhost:9000");
});

// Inject Bower components
gulp.task('wiredep', function () {
    gulp.src('app/styles/*.css')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/bower_components/'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/'
        }))
        .pipe(gulp.dest('app'));
});

// Watch
gulp.task('watch', ['connect', 'serve'], function () {
    // Watch for changes in `app` folder
    gulp.watch([
        'app/*.html',
        'app/resources/css/*.css',
        'app/resources/js/*.js',
        'app/resources/images/*',
        'app/resources/geostyle/*'
    ], function (event) {
        return gulp.src(event.path)
            .pipe($.connect.reload());
    });

    // Watch .css files
    gulp.watch('app/resources/css/*.css', ['styles']);

    // Watch .js files
    gulp.watch('app/resources/js/*.js', ['scripts']);

    // Watch .json files
    gulp.watch('app/resources/geostyle/*.json', ['geostyles']);

    // Watch image files
    gulp.watch('app/resources/images/*', ['images']);

    // Watch bower files
    gulp.watch('bower.json', ['wiredep']);
});
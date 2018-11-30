var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
	' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
	' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
	' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
	' */\n',
	'\n'
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', gulp.parallel(() => {

	// Bootstrap
	gulp.src(['./node_modules/bootstrap/dist/**/*', '!./node_modules/bootstrap/dist/css/bootstrap-grid*', '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'])
		.pipe(gulp.dest('./vendor/bootstrap'))

	// Font Awesome
	gulp.src(['./node_modules/@fortawesome/**/*'])
		.pipe(gulp.dest('./vendor'))

	// jQuery
	gulp.src(['./node_modules/jquery/dist/*', '!./node_modules/jquery/dist/core.js'])
		.pipe(gulp.dest('./vendor/jquery'))

	// jQuery Easing
	gulp.src(['./node_modules/jquery.easing/*.js'])
		.pipe(gulp.dest('./vendor/jquery-easing'))

	// Magnific Popup
	gulp.src(['./node_modules/magnific-popup/dist/*'])
		.pipe(gulp.dest('./vendor/magnific-popup'))

	// Scrollreveal
	return gulp.src(['./node_modules/scrollreveal/dist/*.js'])
		.pipe(gulp.dest('./vendor/scrollreveal'))
}));

// Compile SCSS
gulp.task('css:compile', gulp.parallel(() => {
	return gulp.src('./scss/**/*.scss')
		.pipe(sass.sync({
			outputStyle: 'expanded'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(header(banner, {
			pkg: pkg
		}))
		.pipe(gulp.dest('./css'))
}));

// Minify CSS
gulp.task('css:minify', gulp.parallel('css:compile', () => {
	return gulp.src([
		'./css/*.css',
		'!./css/*.min.css'
	])
		.pipe(cleanCSS())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('./css'))
		.pipe(browserSync.stream());
}));

// CSS
gulp.task('css', gulp.parallel('css:compile', 'css:minify'));

// Minify JavaScript
gulp.task('js:minify', gulp.parallel(() => {
	return gulp.src([
		'./js/*.js',
		'!./js/*.min.js'
	])
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(header(banner, {
			pkg: pkg
		}))
		.pipe(gulp.dest('./js'))
		.pipe(browserSync.stream());
}));

// JS
gulp.task('js', gulp.parallel('js:minify'));

// Default task
gulp.task('default', gulp.series('css', 'js', 'vendor'));

// Configure the browserSync task
gulp.task('browserSync', gulp.parallel(() => {
	browserSync.init({
		server: {
			baseDir: "./"
		}
	});

	gulp.watch(['./scss/*.scss', "!./scss/*.min.scss"], gulp.parallel('css'));
	gulp.watch(['./js/*.js', "!./js/*.min.js"], gulp.parallel('js'));
	gulp.watch('./*.html').on("change", browserSync.reload);
}));

// Dev task
gulp.task('dev', gulp.parallel('css', 'js', 'browserSync'));

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var less = require('gulp-less');
var path = require('path');
var minifyCSS = require('gulp-minify-css');
// var zip = require('gulp-zip');
function errorLog(err) {
	console.log(err);
	// process.exit(-1);
}
// default
gulp.task('default', ['partialsMinify', 'indexMinify', 'scripts', 'lesscss', 'restapi', 'watch']);
gulp.task('initial', ['partialsMinify', 'indexMinify', 'scripts', 'lesscss', 'images', 'cssfonts', 'vendors-styles', 'vendors-scripts', 'restapi']);

gulp.task('watch', function() {
	gulp.watch('src/scripts/**/*.js', ['scripts']);
	gulp.watch('src/partials/**/*', ['partialsMinify']);
	gulp.watch('src/index.html', ['indexMinify']);
	gulp.watch('src/css/*.less', ['lesscss']);
	gulp.watch('src/api/**', ['restapi']);
	// gulp.watch('src/vendors/**/*.js', ['vendors']);
});
//;
gulp.task('partialsMinify', function() {
	return gulp.src('src/partials/**/*.htm').pipe(htmlmin({
		collapseWhitespace: true,
		removeComments: true
	})).pipe(gulp.dest('dist/partials'))
});
gulp.task('indexMinify', function() {
	return gulp.src('src/index.html').pipe(htmlmin({
		collapseWhitespace: true,
		removeComments: true
	})).pipe(gulp.dest('dist/'))
});

gulp.task('scripts', function() {
	var f = 'src/scripts/';
	var a = 'admin/';
	var fr = 'front/';
	gulp.src(
		[
			f + 'app.js',
			f + 'services.js',
			f + 'directives.js',
			// admin area
			f + a + 'users.js',
			f + a + 'forms.js',
			f + a + 'dictionaries.js',
			f + a + 'roles.js',
			f + a + 'permissions.js',
			f + a + 'data.js',
			f + a + 'login.js',
			f + a + 'f-menu.js',
			f + a + 'f-pages.js',
			f + a + 'system-config.js',
			// front area
			f + fr + 'home.js',
		])
		.pipe(concat('app.js'))
		//.pipe(uglify())
		.on('error', errorLog)
		.pipe(gulp.dest('dist/assets/js/'));
});

gulp.task('images', function() {
	return gulp.src(['src/images/**/*.*']).pipe(imagemin({
		// optimizationLevel: 5,
		// progressive: true,
		// interlaced: true
	})).pipe(gulp.dest('dist/assets/images/'));
});
gulp.task('vendors-scripts', function() {
	var v = 'vendors/';
	gulp.src(
		[
			v + 'lodash/dist/lodash.min.js',
			v + 'angular/angular.min.js',
			v + 'angular-autoFields-bootstrap/autofields.min.js',
			v + 'angular-autoFields-bootstrap/autofields-bootstrap.min.js',
			v + 'angular-bootstrap/ui-bootstrap-tpls.min.js',
			v + 'angular-smart-table/dist/smart-table.min.js',
			v + 'angular-ui-router/release/angular-ui-router.min.js',
			v + 'restangular/dist/restangular.min.js',
			v + 'angular-xeditable/dist/js/xeditable.min.js',
			v + 'angular-loading-bar/build/loading-bar.min.js',
			v + 'angular-ipsum/dist/ipsum.min.js',
		]).pipe(concat('vendors.js')).on('error', errorLog).pipe(gulp.dest('dist/assets/js/'));
});
gulp.task('lesscss', function() {
	gulp.src('src/css/style.less').pipe(less({
		paths: [path.join(__dirname, 'less', 'includes')]
	})).pipe(minifyCSS()).pipe(gulp.dest('dist/assets/css/'));
});
gulp.task('vendors-styles', function() {
	var v = 'vendors/';
	return gulp.src([
		v + 'bootstrap/dist/css/bootstrap.min.css',
		v + 'angular-xeditable/dist/css/xeditable.css',
		v + 'angular-loading-bar/build/loading-bar.min.css',
		// v + 'ng-sortable/dist/ng-sortable.style.min.css',
		// v + '',
	]).pipe(concat('vendors.css')).pipe(minifyCSS()).pipe(gulp.dest('dist/assets/css/'));
});
gulp.task('cssfonts', function() {
	var v = 'vendors/';
	gulp.src(
		[
			v + 'bootstrap/dist/fonts/**'
		]).pipe(gulp.dest('dist/assets/fonts/'));
});
// rest api
gulp.task('restapi', function() {
	gulp.src(['src/api/**/*', '!src/api/db/*']).pipe(gulp.dest('dist/api/'));
});

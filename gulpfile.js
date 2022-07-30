const { src, dest, watch, parallel, series } = require('gulp')
const scss = require('gulp-sass')(require('sass')) //  Конвертация из SCSS в CSS
const concat = require('gulp-concat')  //  Переименовывает и объединяет файлы в один
const autoprefixer = require('gulp-autoprefixer')  //  Добавляет вендорные префиксы в CSS
const uglify = require('gulp-uglify')  //  Минифицирует JS айлы
const imagemin = require('gulp-imagemin')
const del = require('del')
const browserSync = require('browser-sync').create()

function styles() {
	return src('app/scss/style.scss')
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(concat('style.min.css'))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 10 versions'],
				grid: true,
			})
		)
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}



function scripts() {
	return src([
		'app/js/main.js',
	])
		.pipe(uglify())
		.pipe(concat('main.min.js'))
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}



function images() {
	return src('app/images/**/*.*')
	.pipe(
		imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({ quality: 75, progressive: true }),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
			}),
		])
	)
	.pipe(dest('dist/images'))
}

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/',
		},
	})
}

function build() {
	return src(['app/**/*.html', 'app/css/style.min.css', 'app/js/main.min.js'], {
		base: 'app',
	}).pipe(dest('dist'))
}

function cleanDist() {
	return del('dist')
}

function watching() {
	watch(['app/scss/**/*.scss'], styles)
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
	watch(['app/**/*.html']).on('change', browserSync.reload)
}

exports.styles = styles
exports.scripts = scripts
exports.browsersync = browsersync
exports.images = images
exports.cleanDist = cleanDist
exports.watching = watching
exports.build = series(cleanDist, images, build)

exports.default = parallel(styles, scripts, browsersync, watching)

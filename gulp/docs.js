// Gulp
const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const changed = require('gulp-changed');
const typograf = require('gulp-typograf');
const replace = require('gulp-replace');
const extReplace = require('gulp-ext-replace');

// Default
const fs = require('fs');

// HTML
const webpHTML = require('gulp-webp-retina-html');
const htmlclean = require('gulp-htmlclean');

// CSS
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const sourceMaps = require('gulp-sourcemaps');
const groupMedia = require('gulp-group-css-media-queries');

// JS
const webpack = require('webpack-stream');
const babel = require('gulp-babel');

// Images
const imagemin = require('gulp-imagemin');
const imageminWebp = require('imagemin-webp');
// const webImagesCSS = require('gulp-web-images-css');  //Вывод WEBP-изображений
const svgsprite = require('gulp-svg-sprite');

const fileIncludeSettings = {
  prefix: '@@', // указывает на то, как импортировать файлы
  basepath: '@file'
}

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: 'Error <%= error.message %>',
      sound: false,
    }),
  };
};

gulp.task('html:docs', function () {
  return gulp
    .src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
    .pipe(changed('./docs/'))
    .pipe(plumber(plumberNotify('HTML')))
    .pipe(fileInclude(fileIncludeSettings))
    .pipe(
			replace(
				/(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
				'$1./$4$5$7$1'
			)
		)
    .pipe(
			typograf({
				locale: ['ru', 'en-US'],
				htmlEntity: { type: 'digit' },
				safeTags: [
					['<\\?php', '\\?>'],
					['<no-typography>', '</no-typography>'],
				],
			})
		)
    .pipe(
			webpHTML({
				extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
				retina: {
					1: '',
					2: '@2x',
				},
			})
		)
    .pipe(htmlclean())
    .pipe(gulp.dest('./docs/'));
});

gulp.task('sass:docs', function () {
  return gulp
    .src('./src/scss/*.scss')
    .pipe(changed('./docs/css/'))
    .pipe(plumber(plumberNotify('SCSS')))
    .pipe(sourceMaps.init())
    .pipe(autoprefixer())
    .pipe(sassGlob())
    .pipe(groupMedia())
    .pipe(sass())
		// .pipe(
		// 	webImagesCSS({
		// 		mode: 'webp',
		// 	})
		// )
		.pipe(
			replace(
				/(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
				'$1$2$3$4$6$1'
			)
		)
    .pipe(csso())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('./docs/css/'));
});

gulp.task('js:docs', function () {
  return gulp
    .src('./src/js/*.js')
    .pipe(changed('./docs/js/'))
    .pipe(plumber(plumberNotify('JS')))
    .pipe(babel())
    .pipe(webpack(require('./../webpack.config.js')))
    .pipe(gulp.dest('./docs/js/'));
});

gulp.task('images:docs', function () {
  return gulp
    .src(['./src/img/**/*', '!./src/img/svgicons/**/*'])
    .pipe(changed('./docs/img/'))
    .pipe(
			imagemin([
				imageminWebp({
					quality: 85,
				}),
			])
		)
    .pipe(extReplace('.webp'))
		.pipe(gulp.dest('./docs/img/'))
		.pipe(gulp.src('./src/img/**/*'))
		.pipe(changed('./docs/img/'))
    .pipe(
			imagemin(
				[
					imagemin.gifsicle({ interlaced: true }),
					imagemin.mozjpeg({ quality: 85, progressive: true }),
					imagemin.optipng({ optimizationLevel: 5 }),
				],
				{ verbose: true }
			)
		)
		.pipe(gulp.dest('./docs/img/'));
});

const svgStack = {
	mode: {
		stack: {
			example: true,
		},
	},
};

const svgSymbol = {
	mode: {
		symbol: {
			sprite: '../sprite.symbol.svg',
		},
	},
	shape: {
		transform: [
			{
				svgo: {
					plugins: [
						{
							name: 'removeAttrs',
							params: {
								attrs: '(fill|stroke)',
							},
						},
					],
				},
			},
		],
	},
};

gulp.task('svgStack:docs', function () {
	return gulp
		.src('./src/img/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgStack))
		.pipe(gulp.dest('./docs/img/svgsprite/'));
});

gulp.task('svgSymbol:docs', function () {
	return gulp
		.src('./src/img/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest('./docs/img/svgsprite/'));
});

gulp.task('files:docs', function () {
  return gulp
    .src('./src/files/**/*')
    .pipe(changed('./docs/files/'))
    .pipe(gulp.dest('./docs/files/'));
});

const serverOptions = {
  livereload: true,
  open: true,
};

gulp.task('server:docs', function () {
  return gulp
	.src('./docs/')
	.pipe(server(serverOptions));
});

gulp.task('clean:docs', function (done) {
  if (fs.existsSync('./docs/')) {
    return gulp
      .src('./docs/', { read: false })
      .pipe(clean({ force: true }));
  }
  done();
});

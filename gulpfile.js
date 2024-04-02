const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');


const fileIncludeSettings = {
  prefix: '@@', // указывает на то, как импортировать файлы
  basepath: '@file'
}

gulp.task('html', function(){
  return gulp
    .src('./src/*.html') // какие файлы использовать
    .pipe(fileInclude(fileIncludeSettings))
    .pipe(gulp.dest('./dist/')); // куда сохранять
});

gulp.task('sass', function(){
  return gulp
  .src('./src/scss/*.scss')
  .pipe(sass())
  .pipe(gulp.dest('./dist/css/'));
});

gulp.task('images', function(){
  return gulp
  .src('./src/img/**/*')
  .pipe(gulp.dest('./dist/img/'));
});

const serverOptions = {
  livereload: true,
  open: true
}

gulp.task('server', function(){
  return gulp
  .src('./dist/')
  .pipe(server(serverOptions))
})

gulp.task ('clean', function(done){
  if (fs.existsSync('./dist/')) {
    return gulp
    .src('./dist/', { read: false })
    .pipe(clean({ force: true }));
  }
  done();
})

// 4830
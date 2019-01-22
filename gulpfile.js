const gulp = require('gulp');
const cssnano = require('gulp-cssnano');
const clean = require('gulp-clean');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const babelify = require("babelify");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const hbsfy = require('hbsfy');

gulp.task('minify', () => {
    return browserify('app/assets/tetris.js').transform(hbsfy.configure({"extensions":"hbs"})).transform(babelify.configure({
        presets: ['@babel/env'],
        //  plugins: ["transform-remove-console"]
    })).bundle()
        .pipe(source('app.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('public'));
});

gulp.task('css', () => {
    return gulp.src('app/assets/*.css')
        .pipe(cssnano())
        //.pipe(rename("app.min.css"))
        .pipe(gulp.dest('public'));
});

gulp.task('clean', () => {
     return gulp.src('public/*', { read: false })
         .pipe(clean())
});



gulp.task('default', gulp.parallel('css', 'minify', () => {
/*    gulp.src('app/!*.html')
        .pipe(gulp.dest('public'))*/
    return gulp.src('public/*.js', { read: false })
        .pipe(clean())
}));

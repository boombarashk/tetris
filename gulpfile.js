const gulp = require('gulp');
const cssnano = require('gulp-cssnano');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('minify', () => {
    return gulp.src('app/assets/tetris.js')
        .pipe(babel({
            presets: ['@babel/env'],
          //  plugins: ["transform-remove-console"]
        }))
        //.pipe(uglify())
        .pipe(rename("app.min.js"))
        .pipe(gulp.dest('public'));
});

gulp.task('css', () => {
    return gulp.src('app/assets/*.css')
        .pipe(cssnano())
        .pipe(rename("app.min.css"))
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

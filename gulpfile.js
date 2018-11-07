const { task, src, dest, parallel } = require('gulp');
const cssnano = require('gulp-cssnano');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const sass = require('gulp-sass');

const webpack = require('webpack-stream');

task('webpack', ()=>{
    return src('app/assets/app.js')
        .pipe(webpack({
            config: require(`${__dirname}/webpack.config.js`)
        }))
        .pipe(dest('app/dist/'))
});

task('sass', ()=> {
    return src('app/assets/styles.scss')
        .pipe(sass())
        .pipe(cssnano())
        .pipe(rename("app.min.css"))
        .pipe(dest('app/dist'))
});



exports.default = parallel('webpack', 'sass', () => {
    //gulp.src('app/*.html').pipe(gulp.dest('public'))
    return src('app/dist/*', { read: false })
        .pipe(clean())
});

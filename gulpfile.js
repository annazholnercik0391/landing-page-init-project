const { src, dest, task, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss')
const csscomb = require('gulp-csscomb')
const notify = require('gulp-notify')
const autoprefixer = require('autoprefixer')
const mqpacker = require('css-mqpacker')
const sortCSSmq = require('sort-css-media-queries')
const terser = require('gulp-terser')
const concat = require('gulp-concat')



const PATH = {
  scssFile: 'assets/scss/style.scss',
  scssFiles: 'assets/scss/**/*.scss',
  scssFolder: 'assets/scss',
  cssFolder: 'assets/css',
  jsFiles: ['assets/js/**/*.js',
    '!.assets/js/**/*.min.js',
    '!.assets/js/**/all.js'],
  jsFolder: 'assets/js',
  jsBundle: 'all.js',
  htmlFiles: '*.html'
}
const PLUGINS = [autoprefixer({ overrideBrowserslist: ['last 5 version', '>0.1%'], cascade: true }),
mqpacker({ sort: sortCSSmq })]

function scss() {
  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', notify.onError((err) => `File: ${err.message}`)))
    .pipe(notify({ message: 'SCSS compiled successfully!' }))
    .pipe(postcss(PLUGINS))
    .pipe(dest(PATH.cssFolder))
    .pipe(browserSync.stream());
}

function scssMin() {
  const pluginsExtended = [...PLUGINS, cssnano({ preset: 'default' })];

  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(pluginsExtended))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssFolder))
}

function scssDev() {
  return src(PATH.scssFile, { sourcemaps: true })
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(dest(PATH.cssFolder, { sourcemaps: true }))
    .pipe(notify({ message: 'SCSS compiled successfully!' }))
}

function comb() {
  return src(PATH.scssFile)
    .pipe(csscomb().on('error', notify.onError((err) => `File: ${err.message}`)))
    .pipe(dest(PATH.scssFolder))

}
function syncInit() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
}

async function sync() {
  browserSync.reload()
}

function watchFiles() {
  syncInit()
  watch(PATH.scssFiles, series(scss, scssMin))
  watch(PATH.htmlFiles, sync)
  watch(PATH.jsFiles, sync)
}

function uglifyJS() {
  return src(PATH.jsFiles)
    .pipe(terser({ toplevel: true, output: { quote_style: 1 } }))

    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.jsFolder))
}

function concatJS() {
  return src(PATH.jsFiles)
    .pipe(concat(PATH.jsBundle))
    .pipe(dest(PATH.jsFolder))
}

task('scss', scss)
task('min', scssMin)
task('dev', scssDev)
task('comb', comb)
task('jsmin', uglifyJS)
task('jsconcat', concatJS)
task('watch', watchFiles)


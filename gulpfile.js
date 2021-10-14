const gulp = require('gulp');
const ts = require('gulp-typescript');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const through2 = require('through2');

const paths = {
  dest: {
    esm: 'dist/esm',
    cjs: 'dist/cjs',
  },
  styles: 'src/**/*.less',
  scripts: ['src/**/*.{ts,tsx}', '!src/**/demo/*.{ts,tsx}', '!src/**/__tests__/*.{ts,tsx}'],
};

function compileCJS() {
  const { dest, scripts } = paths;
  return gulp
    .src(scripts)
    .pipe(
      ts({
        outDir: 'dist',
        target: 'es5',
        module: 'commonjs',
        declaration: true,
        jsx: 'react',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
      }),
    )
    .pipe(
      through2.obj(function z(file, encoding, next) {
        // 找到目标
        if (file.path.match(/(\/|\\)style(\/|\\)index\.(d\.)?(j|t)s/)) {
          const content = file.contents.toString(encoding);
          file.contents = Buffer.from(cssInjection(content)); // 处理文件内容
          this.push(file); // 新增该文件
          next();
        } else {
          this.push(file.clone());
          next();
        }
      }),
    )
    .pipe(gulp.dest(dest.cjs));
}

function compileESM() {
  const { dest, scripts } = paths;
  return gulp
    .src(scripts)
    .pipe(
      ts({
        outDir: 'dist',
        target: 'es5',
        module: 'esnext',
        declaration: true,
        jsx: 'react',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
      }),
    )
    .pipe(
      through2.obj(function z(file, encoding, next) {
        // 找到目标
        if (file.path.match(/(\/|\\)style(\/|\\)index\.(d\.)?(j|t)s/)) {
          const content = file.contents.toString(encoding);
          file.contents = Buffer.from(cssInjection(content)); // 处理文件内容
          this.push(file); // 新增该文件
          next();
        } else {
          this.push(file.clone());
          next();
        }
      }),
    )
    .pipe(gulp.dest(dest.esm));
}

/**
 * 当前组件样式 import './index.less' => import './index.css'
 * 依赖的其他组件样式 import '../test-comp/style' => import '../test-comp/style/css.js'
 * 依赖的其他组件样式 import '../test-comp/style/index.js' => import '../test-comp/style/css.js'
 * @param {string} content
 */
function cssInjection(content) {
  return content
    .replace(/\/style\/?'/g, "/style/css'")
    .replace(/\/style\/?"/g, '/style/css"')
    .replace(/\.less/g, '.css');
}

/**
 * 拷贝less文件
 */
function copyLess() {
  return gulp.src(paths.styles).pipe(gulp.dest(paths.dest.cjs)).pipe(gulp.dest(paths.dest.esm));
}

/**
 * 生成css文件
 */
function less2css() {
  return gulp
    .src(paths.styles)
    .pipe(less({ javascriptEnabled: true })) // 处理less文件
    .pipe(autoprefixer()) // 根据browserslistrc增加前缀
    .pipe(cssnano({ zindex: false, reduceIdents: false })) // 压缩
    .pipe(gulp.dest(paths.dest.cjs))
    .pipe(gulp.dest(paths.dest.esm));
}

const build = gulp.parallel(copyLess, less2css, compileCJS, compileESM);

exports.build = build;

exports.default = build;

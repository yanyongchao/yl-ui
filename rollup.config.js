import path from 'path'
import fs from 'fs'
import commonjs from '@rollup/plugin-commonjs' // 将CommonJS模块转换为 ES2015 供 Rollup 处理
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import postcss from 'rollup-plugin-postcss'
import { DEFAULT_EXTENSIONS } from '@babel/core'

const isDev = process.env.NODE_ENV !== 'production'
const root = path.resolve(__dirname, 'packages')

const getPlugins = () => {
  return [
    typescript({
      tsconfig: './tsconfig.build.json'
    }),
    nodeResolve({
      mainField: ['jsnext:main', 'browser', 'module', 'main'],
      browser: true
    }),
    commonjs(),
    json(),
    postcss({
      plugins: [require('autoprefixer')],
      inject: true,
      minimize: !isDev,
      sourceMap: isDev,
      extensions: ['.sass', '.less', '.scss', '.css'],
      extract: 'style/index.css'
    }),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'runtime',
      extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx']
    }),
    !isDev && terser({ toplevel: true })
  ]
}

module.exports = fs
  .readdirSync(root)
  .filter(item => fs.statSync(path.resolve(root, item)).isDirectory())
  .map(item => {

    const pkg = require(path.resolve(root, item, 'package.json'))

    return {
      input: path.resolve(root, item, 'src/index.tsx'),
      output: [
        {
          name: 'index',
          file: path.resolve(root, item, pkg.main),
          format: 'umd',
          sourcemap: isDev
        },
        {
          name: 'index.module',
          file: path.join(root, item, pkg.module),
          format: 'es',
          sourcemap: isDev
        }
      ],
      plugins: getPlugins(),
      external: Object.keys(require(path.join(root, item, 'package.json'))?.peerDependencies || {})
    }
  })
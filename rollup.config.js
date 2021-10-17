import commonjs from '@rollup/plugin-commonjs' // 将CommonJS模块转换为 ES2015 供 Rollup 处理
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import path from 'path'

const buildESM = {
  input: `./src/index.ts`,
  output: {
    name: 'index',
    file: `dist/esm/index.js`,
    format: 'es'
  },
  external: Object.keys(require(path.resolve('package.json'))?.peerDependencies || {}),
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json'
    }),
    nodeResolve({
      mainField: ['jsnext:main', 'browser', 'module', 'main'],
      browser: true
    }),
    commonjs()
  ]
}

const buildUMD = {
  input: `./src/index.ts`,
  output: {
    name: 'index',
    file: `dist/umd/index.js`,
    format: 'umd'
  },
  external: Object.keys(require(path.resolve('package.json'))?.peerDependencies || {}),
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json'
    }),
    nodeResolve({
      mainField: ['jsnext:main', 'browser', 'module', 'main'],
      browser: true
    }),
    commonjs(),
  ]
}

module.exports = [
  buildESM,
  buildUMD
]
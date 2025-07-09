import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/bundle.js',
      format: 'iife',
      name: 'TubeBouncer',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  {
    input: 'src/options_main.js',
    output: {
      file: 'dist/options_bundle.js',
      format: 'iife',
      name: 'TubeBouncerOptions',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];

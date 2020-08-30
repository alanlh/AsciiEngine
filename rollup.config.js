import {terser} from 'rollup-plugin-terser';


import includePaths from 'rollup-plugin-includepaths';

let includePathOptions = {
  include: {},
  paths: ['src/lib', 'src/other'],
  external: [],
  extensions: ['.js', '.json', '.html']
};

export default [
  {
    input: "src/output.js",
    output: [
      {
        file: "dist/engine.js",
        format: "module",
        name: "AsciiEngine",
      },
      {
        file: "dist/engine.min.js",
        format: "module",
        name: "AsciiEngine",
        plugins: [terser()],
      },
    ],
  },
  {
    input: "src/graphics/AsciiGL.js",
    output: [
      {
        file: "dist/gl.js",
        format: "module",
        name: "AsciiGL",
      },
      {
        file: "dist/gl.min.js",
        format: "module",
        name: "AsciiGL",
        plugins: [terser()],
      },
    ],
  }
]

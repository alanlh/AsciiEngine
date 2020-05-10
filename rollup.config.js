import {terser} from 'rollup-plugin-terser';

export default [
  {
    input: "src/output.js",
    output: [
      {
        file: "dist/engine.js",
        format: "iife",
        name: "AsciiEngine",
      },
      {
        file: "dist/engine.min.js",
        format: "iife",
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
        format: "iife",
        name: "AsciiGL",
      },
      {
        file: "dist/gl.min.js",
        format: "iife",
        name: "AsciiGL",
        plugins: [terser()],
      },
    ],
  }
]

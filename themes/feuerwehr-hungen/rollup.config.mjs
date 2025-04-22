// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// Optional: Import terser for minification
import terser from '@rollup/plugin-terser';

export default {
    input: './js/components/chart.js/auto/auto.js', // Your main entry JS file
    output: {
        file: './js/bundle/bundledChart.js', // Where to save the bundled file
        format: 'es', // 'iife' (Immediately Invoked Function Expression) is good for browser <script> tags
        // Alternatively use 'es' for a modern ES Module bundle
        sourcemap: true, // Optional: Generate source maps for debugging
        name: 'AttendanceApp' // Optional: A global variable name for the IIFE bundle
    },
    plugins: [
        resolve(), // Finds modules using the Node resolution algorithm
        commonjs(), // Converts CommonJS modules to ES6
        terser() // Optional: Minify the output bundle
    ]
};
'use strict';

const { series, parallel } = require('gulp');
const { rm } = require('node:fs/promises');
const esbuild = require('esbuild');

function clean() {
    return rm('dist', { recursive: true, force: true });
}

function build() {
    return esbuild.build({
        entryPoints: ['src/index.js'],
        outfile: 'dist/draughts-pdn-parser.js',
        bundle: true,
        format: 'iife'
    });
}

function buildMin() {
    return esbuild.build({
        entryPoints: ['src/index.js'],
        outfile: 'dist/draughts-pdn-parser.min.js',
        bundle: true,
        format: 'iife',
        minify: true
    });
}

exports.clean = clean;
exports.build = series(clean, parallel(build, buildMin));
exports.default = exports.build;

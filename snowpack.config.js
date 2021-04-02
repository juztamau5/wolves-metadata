/*
 * Copyright (C) 2021 The Wolfpack
 * This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

/* eslint @typescript-eslint/no-var-requires: "off" */

// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

const globals = require("rollup-plugin-node-globals");
const polyfills = require("rollup-plugin-node-polyfills");
const resolve = require("@rollup/plugin-node-resolve").nodeResolve;

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  plugins: ["@snowpack/plugin-typescript"],
  mount: {
    public: "/",
    src: "/_dist_",
  },
  buildOptions: {
    minify: false,
    sourceMap: true,
  },
  optimize: {
    treeshake: true,
  },
  packageOptions: {
    rollup: {
      plugins: [
        // Fix "Uncaught TypeError: bufferEs6.hasOwnProperty is not a function"
        resolve({ preferBuiltins: false }),
        globals(),
        polyfills(),
      ],
    },
  },
};

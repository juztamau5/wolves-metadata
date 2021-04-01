/*
 * Copyright (C) 2021 The Wolfpack
 * This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "simple-import-sort"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: {
    amd: true,
    browser: true,
    es2021: true,
    node: true,
  },
  rules: {
    "simple-import-sort/imports": "error",
  },
};

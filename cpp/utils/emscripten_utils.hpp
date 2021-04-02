/*
 * Copyright (C) 2021 The Wolfpack
 * This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#pragma once

#include <emscripten/val.h>
#include <stdint.h>

class EmscriptenUtils
{
public:
  /*!
   * \brief Get the length of the JavaScript array
   *
   * \param array An array of type Uint8ClampedArray
   *
   * \return The length as returned by array.length
   */
  static unsigned int ArrayLength(const emscripten::val& array);

  /*!
   * \brief Copy array data from JavaScript into the WASM engine
   *
   * \param array An array of type Uint8ClampedArray
   * \param dest The destination memory
   * \param destLength The size of the buffer pointed to by dest
   */
  static void GetArrayData(const emscripten::val& array, uint8_t* dest, unsigned int destLength);
};

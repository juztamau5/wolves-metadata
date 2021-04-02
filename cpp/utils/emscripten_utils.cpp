/*
 * Copyright (C) 2021 The Wolfpack
 * This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "emscripten_utils.hpp"

unsigned int EmscriptenUtils::ArrayLength(const emscripten::val& array)
{
  return array["length"].as<unsigned int>();
}

void EmscriptenUtils::GetArrayData(const emscripten::val& array, uint8_t* dest, unsigned int destLength)
{
  emscripten::val memoryView{emscripten::typed_memory_view(destLength, dest)};
  memoryView.call<void>("set", array);
}

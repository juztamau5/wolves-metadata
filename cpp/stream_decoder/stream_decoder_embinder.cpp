/*
 * Copyright (C) 2021 The Wolfpack
 * This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "stream_decoder.h"

#include <emscripten/bind.h>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(stream_decoder)
{
  enum_<StreamDecoderState>("StreamDecoderState")
    .value("Init", StreamDecoderState::Init)
    .value("Running", StreamDecoderState::Running)
    .value("HasFrame", StreamDecoderState::HasFrame)
    .value("Ended", StreamDecoderState::Ended)
    .value("Failed", StreamDecoderState::Failed)
    ;

  class_<StreamDecoder>("StreamDecoder")
    .constructor<const std::string&, int, int>()
    .property("state", &StreamDecoder::GetState)
    .property("frameSize", &StreamDecoder::GetFrameSize)
    .property("frameWidth", &StreamDecoder::GetFrameWidth)
    .property("frameHeight", &StreamDecoder::GetFrameHeight)
    .function("addPacket", &StreamDecoder::AddPacket)
    .function("openVideo", &StreamDecoder::OpenVideo)
    .function("decode", &StreamDecoder::Decode)
    .function("getFrame", &StreamDecoder::GetFrame)
    ;
}

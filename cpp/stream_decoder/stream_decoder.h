/*
 * Copyright (C) 2021 The Wolfpack
 * This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#pragma once

#include <stdint.h>
#include <string>
#include <vector>

extern "C"
{
#include <libavformat/avformat.h>
#include <libavformat/avio.h>
#include <libswscale/swscale.h>
}

namespace emscripten
{
class val;
}

enum class StreamDecoderState
{
  Init,
  Running,
  HasFrame,
  Ended,
  Failed,
};

class StreamDecoder
{
public:
  StreamDecoder(const std::string& fileName, int blockSize, int maxDecodedSize);
  ~StreamDecoder();

  StreamDecoderState GetState() const { return m_state; }
  unsigned int GetFrameSize() const { return m_frameSize; }
  unsigned int GetFrameWidth() const { return m_width; }
  unsigned int GetFrameHeight() const { return m_height; }

  void AddPacket(const emscripten::val& packet);
  bool OpenVideo();
  void Decode();
  // TODO: "Can't use void* because embind has problems with a getter that returns
  // a raw pointer"
  uintptr_t GetFrame();

private:
  bool Initialize();
  void Deinitialize();

  unsigned int GetReadPosition() const { return m_readPosition; }
  unsigned int GetTotalSize() const { return m_totalSize; }

  unsigned int ReadPacket(uint8_t* buffer, unsigned int bufferSize);
  uint64_t Seek(uint64_t offset);

  static int ReadPacketInternal(void* context, uint8_t* buffer, int bufferSize);
  static int64_t SeekInternal(void* context, int64_t offset, int whence);

  // Construction parameters
  const std::string m_fileName;
  const unsigned int m_blockSize;
  const unsigned int m_maxDecodedSize;

  // State parameters
  StreamDecoderState m_state = StreamDecoderState::Init;

  // Video parameters
  int m_videoStreamId = -1;
  unsigned int m_width = 0;
  unsigned int m_height = 0;
  unsigned int m_frameSize = 0;
  static const AVPixelFormat m_targetFormat = AV_PIX_FMT_RGBA;

  // Video resources
  AVIOContext* m_ioContext = nullptr;
  AVFormatContext* m_pFormatContext = nullptr;
  AVCodecContext* m_videoCodecContext = nullptr;
  SwsContext* m_scaler = nullptr;
  AVFrame* m_decodedFrame = nullptr;
  uint8_t* m_videoBuffer = nullptr;

  // TODO[
  std::vector<std::vector<uint8_t>> m_packets;
  uint64_t m_totalSize = 0;
  uint64_t m_readPosition = 0;
};

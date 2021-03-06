################################################################################
#
#  Copyright (C) 2021 The Wolfpack
#  This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
#
#  SPDX-License-Identifier: Apache-2.0
#  See the file LICENSE.txt for more information.
#
################################################################################

################################################################################
#
# Build system for C++ libraries
#
# Required environment parameters:
#
#   TEST_DIRECTORY - The directory where libraries are placed for testing
#
# Required CMake variables:
#
#   CMAKE_FIND_ROOT_PATH - Point this to dependencies compiled with Emscripten
#   CMAKE_INSTALL_PREFIX - Point this to the "public" folder
#
################################################################################

################################################################################
#
# Project settings
#
################################################################################

project(wolves-metadata-cpp)

cmake_minimum_required(VERSION 3.0.0)

set(CMAKE_CXX_STANDARD 17)

################################################################################
#
# Dependencies
#
################################################################################

# FFmpeg
find_path(AVCODEC_INCLUDE_DIR libavcodec/avcodec.h PATHS "${CMAKE_PREFIX_PATH}/include")
find_path(AVFORMAT_INCLUDE_DIR libavformat/avformat.h PATHS "${CMAKE_PREFIX_PATH}/include")
find_path(AVUTIL_INCLUDE_DIR libavutil/avutil.h PATHS "${CMAKE_PREFIX_PATH}/include")

find_library(AVCODEC_LIBRARY avcodec PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(AVFILTER_LIBRARY avfilter PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(AVFORMAT_LIBRARY avformat PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(AVUTIL_LIBRARY avutil PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(LAME_LIBRARY mp3lame PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(OPENH264_LIBRARY openh264 PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(OPUS_LIBRARY opus PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(SWRESAMPLE_LIBRARY swresample PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(SWSCALE_LIBRARY swscale PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(VPX_LIBRARY vpx PATHS "${CMAKE_PREFIX_PATH}/lib")
find_library(X264_LIBRARY x264 PATHS "${CMAKE_PREFIX_PATH}/lib")

################################################################################
#
# Define sources
#
################################################################################

#
# Stream decoder
#

set(STREAM_DECODER_SOURCES
  stream_decoder/stream_decoder.cpp
  stream_decoder/stream_decoder_embinder.cpp
  utils/emscripten_utils.cpp
)

################################################################################
#
# Build libraries
#
# TODO:
#
#   * Build properly instead of shelling out
#   * Could refactor this into macros
#
################################################################################

include_directories(
  ${CMAKE_SOURCE_DIR}
)

string(APPEND EMSCRIPTEN_LINK_FLAGS
  "--bind "
  # "-o dist/engine.js "
  # " -std=c++11 "
  # " -O2 "
  # " --preload-file textures "
  # " --preload-file shaders "
  # " --preload-file fonts "
  # " --pre-js pre-module.j "
  # " --post-js post-module.j "
  "-s ALLOW_MEMORY_GROWTH=1 "
  "-s ASSERTIONS=1 "
  # " -s DEMANGLE_SUPPORT=1 "
  # " -s DISABLE_EXCEPTION_CATCHING=0 "
  "-s ERROR_ON_UNDEFINED_SYMBOLS=0 "
  # " -s FULL_ES3=1 "
  # " -s GL_ASSERTIONS=1 "
  # " -s GL_UNSAFE_OPTS=0 "
  # " -s INVOKE_RUN=0 "
  # " -s LEGACY_GL_EMULATION=0 "
  #"-s LLD_REPORT_UNDEFINED "
  # " -s OFFSCREENCANVAS_SUPPORT=1 "
  # " -s SAFE_HEAP=1 "
  #"-s TOTAL_MEMORY=67108864 "
  # " -s USE_FREETYPE=1 "
  # " -s USE_GLFW=3 "
  # " -s USE_WEBGL2=1 "
  "-s USE_ZLIB=1 "
  # " -s WASM=1 "
)

#
# Stream decoder
#

add_executable(stream_decoder
  ${STREAM_DECODER_SOURCES}
)

target_include_directories(stream_decoder PRIVATE
  ${AVCODEC_INCLUDE_DIR}
  ${AVFORMAT_INCLUDE_DIR}
  ${AVUTIL_INCLUDE_DIR}
)

target_link_libraries(stream_decoder PRIVATE
  ${AVCODEC_LIBRARY}
  ${AVFORMAT_LIBRARY}
  ${AVUTIL_LIBRARY}
  ${LAME_LIBRARY}
  ${OPENH264_LIBRARY}
  ${OPUS_LIBRARY}
  ${SWRESAMPLE_LIBRARY}
  ${SWSCALE_LIBRARY}
  ${VPX_LIBRARY}
  ${X264_LIBRARY}
)

if (${CMAKE_SYSTEM_NAME} MATCHES "Emscripten")
  set_target_properties(stream_decoder PROPERTIES
    COMPILE_FLAGS " \
      -Wno-deprecated \
      -s ASSERTIONS=1 \
    "
    LINK_FLAGS ${EMSCRIPTEN_LINK_FLAGS})
endif ()

################################################################################
#
# Install libraries
#
################################################################################

#
# Stream decoder
#

INSTALL(
  FILES
    "${CMAKE_BINARY_DIR}/stream_decoder.js"
    "${CMAKE_BINARY_DIR}/stream_decoder.wasm"
  DESTINATION
    "${TEST_DIRECTORY}"
)

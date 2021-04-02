#!/bin/bash
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
# Helper for CI infrastructure. Sets the appropriate paths and calls CMake.
#
################################################################################

# Enable strict shell mode
set -o errexit
set -o nounset
set -o pipefail

#
# Environment paths
#

# Get the absolute path to this script
SOURCE_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Directory of the depends build system
TOOL_DIRECTORY="${SOURCE_DIRECTORY}/../tools"

# Directory for intermediate build files
BUILD_DIRECTORY="${TOOL_DIRECTORY}/build/cpp-libs"

# Directory of the Emscripten SDK
EMSDK_DIRECTORY="${TOOL_DIRECTORY}/repos/emsdk"

# Directory of the installed dependency files
DEPENDS_DIRECTORY="${TOOL_DIRECTORY}/dist"

# Directory to place the generated libraries
INSTALL_DIRECTORY="${SOURCE_DIRECTORY}/../public"

# Directory to place the generated libraries for testing
TEST_DIRECTORY="${SOURCE_DIRECTORY}/../test/generated"

# Ensure directories exist
mkdir -p "${BUILD_DIRECTORY}"
mkdir -p "${INSTALL_DIRECTORY}"
mkdir -p "${TEST_DIRECTORY}"

#
# Setup environment
#

source "${EMSDK_DIRECTORY}/emsdk_set_env.sh"

#
# Call CMake
#

cd "${BUILD_DIRECTORY}"

emcmake cmake \
  "${SOURCE_DIRECTORY}" \
  -DCMAKE_FIND_ROOT_PATH="${DEPENDS_DIRECTORY}" \
  -DCMAKE_INSTALL_PREFIX="${INSTALL_DIRECTORY}" \
  -DTEST_DIRECTORY="${TEST_DIRECTORY}" \
  $(! command -v ccache &> /dev/null || echo "-DCMAKE_CXX_COMPILER_LAUNCHER=ccache") \

#cmake --build "${BUILD_DIRECTORY}" --target install
make -C "${BUILD_DIRECTORY}" -j8 install

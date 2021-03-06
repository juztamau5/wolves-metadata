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
# Build chain for dependendies
#
# Make is used to run shell commands instead of bash to allow for parallel
# intermediary build stages.
#
# The primary build stages that can be specified on the command line are:
#
#   1. checkout
#   2. build
#   3. install (default if no stage is given)
#
# Two stages are used for cleaning temoprary files:
#
#   1. clean
#   2. distclean
#
# "make clean" is used to remove temporary build artifacts. "make distclean" is
# used to remove all temporary files and reset the directory to an unused state.
#
# This Makefile depends on the following packages:
#
#   - git
#
################################################################################

# Build system setup
include setup_stages.mk
include setup_paths.mk

# Define the shell used to execute commands
SHELL := /bin/bash

################################################################################
#
# Import package rules
#
################################################################################

include depends/native/emscripten/package.mk
include depends/wasm/codecbox.js/package.mk
include depends/wasm/ffmpeg/package.mk
include depends/wasm/libvpx/package.mk
include depends/wasm/x264/package.mk

################################################################################
#
# Build system targets
#
# Defines the targets that are build when "make" is run.
#
################################################################################

#
# Define targets for "make checkout"
#

CHECKOUT_DEPENDS = \
  $(S)/checkout-codecbox.js \
  $(S)/checkout-emscripten \
  $(S)/checkout-ffmpeg \
  $(S)/checkout-libvpx \
  $(S)/checkout-x264 \

#
# Define targets for "make build"
#

BUILD_DEPENDS = \
  $(S)/build-ffmpeg \

#
# Define targets for "make install"
#

INSTALL_DEPENDS = \
  $(S)/install-ffmpeg \

#
# Inject targets
#

checkout: $(CHECKOUT_DEPENDS)
build: $(BUILD_DEPENDS)
install: $(INSTALL_DEPENDS)

#
# Define targets for building individual depends via "make <depend>"
#

.PHONY: codecbox.js
.PHONY: emscripten
.PHONY: ffmpeg
.PHONY: libvpx
.PHONY: x264

codecbox.js: \
  $(S)/install-codecbox.js

emscripten: \
  $(S)/build-emscripten

ffmpeg: \
  $(S)/install-ffmpeg

libvpx: \
  $(S)/install-libvpx

x264: \
  $(S)/install-x264

################################################################################
#
# Build system procedures
#
################################################################################

#
# Clean stage
#

clean:
	rm -rf "$(BUILD_DIR)"
	rm -rf "$(S)"

#
# Distclean stage
#

distclean: clean
	rm -rf "$(REPO_DIR)"

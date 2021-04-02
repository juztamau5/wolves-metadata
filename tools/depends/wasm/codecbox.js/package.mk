################################################################################
#
#  Copyright (C) 2021 The Wolfpack
#  This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
#
#  SPDX-License-Identifier: Apache-2.0
#  See the file LICENSE.txt for more information.
#
################################################################################

# Dependency name and version
CODECBOX_JS_REPO_NAME = codecbox.js
CODECBOX_JS_VERSION = c31de35d32cc9e3f01dd577b3c27df7f24e599ed
CODECBOX_JS_REMOTE_REPO = https://github.com/duanyao/$(CODECBOX_JS_REPO_NAME).git

################################################################################
#
# Paths
#
################################################################################

# Checkout directory
REPO_DIR_CODECBOX_JS = $(REPO_DIR)/$(CODECBOX_JS_REPO_NAME)

# Build directory
BUILD_DIR_CODECBOX_JS = $(BUILD_DIR)/$(CODECBOX_JS_REPO_NAME)

################################################################################
#
# Configuration
#
################################################################################

CODECBOX_JS_BUILD_DEPENDS = \
  $(S)/checkout-codecbox.js \
  $(S)/build-emscripten \

################################################################################
#
# Checkout
#
# Dependency: Run `yarn install` first
#
################################################################################

$(S)/checkout-codecbox.js: $(S)/.precheckout \
  $(TOOL_DIR)/depends/wasm/codecbox.js/0001-Fix-error-building-OpenH264.patch \
  $(TOOL_DIR)/depends/wasm/codecbox.js/0002-Fix-errors-building-with-latest-llvm.patch \
  $(TOOL_DIR)/depends/wasm/codecbox.js/0003-Enable-select-filter.patch \
  $(TOOL_DIR)/depends/wasm/codecbox.js/0004-Don-t-call-bash-with-x.patch \
  $(TOOL_DIR)/depends/wasm/codecbox.js/0005-Don-t-download-FFmpeg.patch \
  $(TOOL_DIR)/depends/wasm/openh264/0001-Fix-build-on-macOS.patch \
  $(TOOL_DIR)/depends/wasm/x264/0001-Remove-problematic-configure-test.patch
	# Clone repo
	[ -d "$(REPO_DIR_CODECBOX_JS)" ] || ( \
	  git clone "$(CODECBOX_JS_REMOTE_REPO)" "$(REPO_DIR_CODECBOX_JS)" \
	)

	# Reset repo state
	git -C "$(REPO_DIR_CODECBOX_JS)" reset --hard $(CODECBOX_JS_VERSION)

	# Remove stale dependencies
	rm -rf "$(REPO_DIR_CODECBOX_JS)/build"

	# Patch repo
	cd "$(REPO_DIR_CODECBOX_JS)" && git am < \
	  "$(TOOL_DIR)/depends/wasm/codecbox.js/0001-Fix-error-building-OpenH264.patch"
	cd "$(REPO_DIR_CODECBOX_JS)" && git am < \
	  "$(TOOL_DIR)/depends/wasm/codecbox.js/0002-Fix-errors-building-with-latest-llvm.patch"
	cd "$(REPO_DIR_CODECBOX_JS)" && git am < \
	  "$(TOOL_DIR)/depends/wasm/codecbox.js/0003-Enable-select-filter.patch"
	cd "$(REPO_DIR_CODECBOX_JS)" && git am < \
	  "$(TOOL_DIR)/depends/wasm/codecbox.js/0004-Don-t-call-bash-with-x.patch"
	cd "$(REPO_DIR_CODECBOX_JS)" && git am < \
	  "$(TOOL_DIR)/depends/wasm/codecbox.js/0005-Don-t-download-FFmpeg.patch"

	# Clone depends
	cd "$(REPO_DIR_CODECBOX_JS)" && \
	PATH="$(TOOL_DIR)/../node_modules/.bin:${PATH}" \
	  grunt init --force

	# Patch depends
	cd "$(REPO_DIR_CODECBOX_JS)/build/openh264" && git am < \
	  "$(TOOL_DIR)/depends/wasm/openh264/0001-Fix-build-on-macOS.patch"
	#cd "$(REPO_DIR_CODECBOX_JS)/build/x264" && git am < \
	#  "$(TOOL_DIR)/depends/wasm/x264/0001-Remove-problematic-configure-test.patch"
	# TODO: Is zlib patch necessary?

	touch "$@"

################################################################################
#
# Build
#
################################################################################

$(S)/build-codecbox.js: $(S)/.prebuild $(CODECBOX_JS_BUILD_DEPENDS)
	# Deep-copy repo to build folder for now
	[ -d "$(BUILD_DIR_CODECBOX_JS)" ] || ( \
	  cp -r "$(REPO_DIR_CODECBOX_JS)" "$(BUILD_DIR_CODECBOX_JS)" \
	)

	# Source Emscripten environment, then build Codecbox.js and dependencies
	cd "$(BUILD_DIR_CODECBOX_JS)" && \
	  . "$(REPO_DIR_EMSDK)/emsdk_set_env.sh" && \
	  export PATH="$(TOOL_DIR)/../node_modules/.bin:$${PATH}" && \
	  grunt configure-deps && \
	  grunt make-deps

	touch "$@"

################################################################################
#
# Install
#
################################################################################

$(S)/install-codecbox.js: $(S)/.precheckout $(S)/build-codecbox.js
	install -d "$(TOOL_DIR)/dist"

	# Copy dist folder
	cp -r "${BUILD_DIR_CODECBOX_JS}/build/dist"/* "$(TOOL_DIR)/dist"

	touch "$@"

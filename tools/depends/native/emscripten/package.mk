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
EMSDK_REPO_NAME = emsdk
EMSDK_VERSION = 1.39.18
EMSDK_SDK_TOOLS_VERSION = latest-upstream
EMSDK_REMOTE_REPO = https://github.com/emscripten-core/$(EMSDK_REPO_NAME).git
EMSDK_BINARY = emsdk

################################################################################
#
# Paths
#
################################################################################

# Checkout directory
REPO_DIR_EMSDK = $(REPO_DIR)/$(EMSDK_REPO_NAME)

################################################################################
#
# Checkout
#
################################################################################

$(S)/checkout-emscripten: $(S)/.precheckout
	[ -d "$(REPO_DIR_EMSDK)" ] || git clone -b $(EMSDK_VERSION) "$(EMSDK_REMOTE_REPO)" "$(REPO_DIR_EMSDK)"

	@# TODO: Repository sync is delegated to the CI system.

	# Download and install the latest SDK tools.
	cd "$(REPO_DIR_EMSDK)" && \
	  "$(REPO_DIR_EMSDK)/emsdk" install --build=Release --shallow $(EMSDK_SDK_TOOLS_VERSION)

	touch "$@"

################################################################################
#
# Build
#
################################################################################

$(S)/build-emscripten: $(S)/.prebuild $(S)/checkout-emscripten
	# Make SDK "active" for the current user (writes .emscripten file)
	cd "$(REPO_DIR_EMSDK)" && \
	  "$(REPO_DIR_EMSDK)/emsdk" activate $(EMSDK_SDK_TOOLS_VERSION)

	# Create an evironment setup script
	cd "$(REPO_DIR_EMSDK)" && \
	  "$(REPO_DIR_EMSDK)/emsdk" construct_env

	touch "$@"

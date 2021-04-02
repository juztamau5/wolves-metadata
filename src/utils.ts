/*
 * Copyright (C) 2021 The Wolfpack
 * This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

// SI file size strings
function fileSizeSI(size: number): string {
  let exp: number = (Math.log(size) / Math.log(1e3)) | 0;

  return (
    (size / Math.pow(1e3, exp)).toFixed(0) +
    " " +
    (exp ? "kMGTPEZY"[--exp] + "B" : "Bytes")
  );
}

function getRtcConfig(): Record<string, unknown> {
  return {
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
      },
      {
        urls: "stun:stun.framasoft.org",
      },
    ],
  };
}

// ---------------------------------------------------------------------------

export { fileSizeSI, getRtcConfig };

/*
 * Copyright (C) 2021 The Wolfpack
 * This file is part of wolves-metadata - https://github.com/wolvesofwallstreet/wolves-metadata
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

/* eslint @typescript-eslint/no-explicit-any: "off" */

import { ImageData } from "canvas";
import chai from "chai";
import { spawn, Thread, Transfer, Worker } from "threads";
import WebTorrent from "webtorrent";

import { fileSizeSI, getRtcConfig } from "../src/utils";

// Sintel, a free, Creative Commons movie
const TORRENT_ID =
  "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent";

// Maximum width or height of decoded image
const MAX_DECODED_SIZE = 256;

// Number of frames to receive from the decoder
const PROCESS_FRAMES = 10;

// Promise that is resolved when a decoded frame is processed
let resolveFrameProcessed: () => void;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Stream decoder", function () {
  // Torrent parameters
  let blockSize = 0;

  // File parameters
  let file: any = null;

  // Stream parameters
  const fileChunks: Array<Uint8Array> = [];

  // Video parameters
  let videoFrameWidth = 0;
  let videoFrameHeight = 0;
  let videoFrameProcessed: Promise<void> | undefined;

  // Scene parameters
  let sceneFrameCount = 0;
  const sceneFrameIds: Array<number> = [];

  // Stream decoder
  let decoderWorker: any = null;

  // Webtorrent client
  let client: any = null;

  before(async function () {
    this.timeout(5000); // TODO

    // Stream decoder
    decoderWorker = await spawn(
      new Worker("../src/workers/stream_decoder_module")
    );
    decoderWorker
      .onMetadataAvailable()
      .subscribe(
        ({
          frameSize,
          frameWidth,
          frameHeight,
        }: {
          frameSize: number;
          frameWidth: number;
          frameHeight: number;
        }) => {
          videoFrameWidth = frameWidth;
          videoFrameHeight = frameHeight;

          // Unused
          frameSize;
        }
      );
    decoderWorker.onFrameAvailable().subscribe(async (buffer: Uint32Array) => {
      const pixelData = new Uint8ClampedArray(buffer);
      const videoFrame = new ImageData(
        pixelData,
        videoFrameWidth,
        videoFrameHeight
      );

      chai.expect(videoFrame.data.buffer.byteLength).to.equal(pixelData.length);
      chai.expect(videoFrame.width).to.equal(videoFrameWidth);
      chai.expect(videoFrame.height).to.equal(videoFrameHeight);

      sceneFrameIds.push(sceneFrameCount++);
      resolveFrameProcessed();
    });

    client = new WebTorrent({
      tracker: {
        rtcConfig: getRtcConfig(),
      },
    });
    client.on("error", function (err: string | undefined) {
      chai.assert.fail(err);
    });
    client.on("warning", function (err: string | undefined) {
      chai.assert.fail(err);
    });
  });

  after(async function () {
    if (client) {
      client.destroy();
    }
    await Thread.terminate(decoderWorker);
  });

  it("should have spawned workers", async function () {
    chai.expect(decoderWorker).to.be.an("object");
  });

  it("should download torrent metadata within 10s", function (done) {
    this.timeout(10 * 1000);

    client.add(TORRENT_ID, (torrent: any) => {
      blockSize = torrent.pieceLength;
      console.log(`  Block size: ${blockSize}`);
      chai.expect(blockSize).to.be.greaterThan(0);
      done();
    });
  });

  it("should find an mp4 file", async function () {
    // Get the .mp4 file
    file = client.torrents[0].files.find(function (file: any) {
      return file.name.endsWith(".mp4");
    });

    chai.expect(file.name).to.be.a("string");
  });

  it("should initialize the module workers", async function () {
    chai.expect(file.name).to.be.a("string");
    chai.expect(blockSize).to.be.greaterThan(0);

    return Promise.all([
      decoderWorker.initialize(file.name, blockSize, MAX_DECODED_SIZE),
    ]);
  });

  it("should stream video for up to 60s", async function () {
    this.timeout(61 * 1000);

    // Total size of processed data
    let totalSize = 0;

    // Create a readable stream
    const stream = file.createReadStream(); // TODO: Type

    console.log(`  Streaming ${file.name} (${fileSizeSI(file.length)})`);

    // Ready for data
    stream.on("data", (chunk: Uint8Array) => {
      totalSize += chunk.length;
      fileChunks.push(chunk);
    });

    // Wait for stream end or timeout, whichever occurs first
    await Promise.race([
      new Promise((resolve) => {
        stream.on("end", () => {
          resolve(null);
        });
      }),
      sleep(60 * 1000),
    ]);

    // Done with stream
    stream.destroy();

    console.log(
      `  Total chunks read: ${fileChunks.length}, total size: ${fileSizeSI(
        totalSize
      )}`
    );

    chai.expect(fileChunks.length).to.be.greaterThan(0);
    chai.expect(totalSize).to.be.greaterThan(0);
  });

  it("should stream file data to decoder", async function () {
    this.timeout(15 * 1000);

    chai.expect(fileChunks.length).to.be.greaterThan(0);

    for (const _chunk of fileChunks) {
      const chunk: Uint8Array = _chunk as Uint8Array;

      const result: boolean = await decoderWorker.addPacket(
        Transfer(chunk.buffer),
        chunk.byteOffset,
        chunk.byteLength
      );
      chai.expect(result, "result of decoderWorker.addPacket()").to.be.true;
    }
  });

  it("should open the video", async function () {
    this.timeout(10 * 1000);

    const result: boolean = await decoderWorker.openVideo();
    chai.expect(result, "result of decoderWorker.openVideo()").to.be.true;

    chai.expect(videoFrameWidth).to.be.greaterThan(0);
    chai.expect(videoFrameHeight).to.be.greaterThan(0);
  });

  it(`should decode and process ${PROCESS_FRAMES} frames`, async function () {
    chai.expect(videoFrameWidth).to.be.greaterThan(0);
    chai.expect(videoFrameHeight).to.be.greaterThan(0);

    for (let frameCount = 0; frameCount < PROCESS_FRAMES; frameCount++) {
      videoFrameProcessed = new Promise((resolve) => {
        resolveFrameProcessed = () => {
          resolve();
        };
      });
      if (!(await decoderWorker.decode())) {
        break;
      }
      await videoFrameProcessed;
    }

    console.log(`  Processed ${sceneFrameIds.length} scenes`);
    chai.expect(sceneFrameIds.length).to.equal(PROCESS_FRAMES);
  });

  it("should close the video", async function () {
    await decoderWorker.closeVideo();
  });

  it("should terminate webtorrent client", async function () {
    client.destroy();
    client = null;
  });

  it("should terminate workers", async function () {
    return Promise.all([Thread.terminate(decoderWorker)]);
  });
});

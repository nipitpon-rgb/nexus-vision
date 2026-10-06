import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17]
];

export class HandTracker {
  constructor({video, canvas, onResults, onState}) {
    this.video = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onResults = onResults;
    this.onState = onState;
    this.landmarker = null;
    this.enabled = true;
    this.showLandmarks = true;
    this.running = false;
    this.lastVideoTime = -1;
    this.lastFrame = performance.now();
    this.fps = 0;
    this.smooth = new Map();
  }

  async init() {
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.55,
      minTrackingConfidence: 0.55
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.onState?.("TRACKING");
    requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
  }

  reset() {
    this.clearCanvas();
    this.onState?.("IDLE");
  }

  async loop(now) {
    if (!this.running) return;

    if (this.video.readyState >= 2 && this.video.videoWidth) {
      this.resizeCanvas();

      if (this.video.currentTime !== this.lastVideoTime) {
        const result = this.landmarker.detectForVideo(this.video, now);
        this.lastVideoTime = this.video.currentTime;
        this.draw(result);
        this.updateFps(now);
        this.onResults?.(result);
      }
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  draw(result) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.showLandmarks || !result?.landmarks?.length) return;

    const sx = this.canvas.width / this.video.videoWidth;
    const sy = this.canvas.height / this.video.videoHeight;

    result.landmarks.forEach((landmarks, handIndex) => {
      const points = landmarks.map((p, i) => {
        const x = (this.video.classList.contains("mirrored") ? 1 - p.x : p.x) * this.canvas.width;
        const y = p.y * this.canvas.height;
        return {x, y, z: p.z, i};
      });

      ctx.lineWidth = Math.max(1, 1.2 * (window.devicePixelRatio || 1));
      ctx.strokeStyle = handIndex % 2 ? "rgba(139,92,246,.78)" : "rgba(34,211,238,.82)";
      ctx.shadowBlur = 9;
      ctx.shadowColor = handIndex % 2 ? "#8b5cf6" : "#22d3ee";

      CONNECTIONS.forEach(([a,b]) => {
        const p1 = points[a], p2 = points[b];
        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();
      });

      ctx.shadowBlur = 16;
      points.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = "#dffbff";
        ctx.arc(p.x,p.y,2.7 * (window.devicePixelRatio || 1),0,Math.PI*2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    });
  }

  updateFps(now) {
    const delta = now - this.lastFrame;
    this.lastFrame = now;
    const instant = delta > 0 ? 1000 / delta : 0;
    this.fps = this.fps ? this.fps * .9 + instant * .1 : instant;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

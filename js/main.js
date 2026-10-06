import { CameraController } from "./camera.js";
import { HandTracker } from "./mediapipe.js";
import { GestureEngine } from "./gestures.js";
import { CharacterSystem } from "./characters.js";
import { UIController } from "./ui.js";

const video = document.querySelector("#video");
const canvas = document.querySelector("#landmarkCanvas");

const ui = new UIController();
const characters = new CharacterSystem(ui);
const gestures = new GestureEngine();
const camera = new CameraController(video, {
  onState: state => ui.setCameraState(state),
  onError: error => ui.showError("CAMERA ACCESS DENIED", error?.message || "Please allow camera permission to enable hand tracking.")
});

const tracker = new HandTracker({
  video,
  canvas,
  onState: state => ui.setVisionState(state),
  onResults: result => {
    if (!ui.trackingEnabled) return;
    const analysis = gestures.analyze(result);
    window.__nexusFps = tracker.fps;
    ui.updateTracking(result, analysis);
    characters.react(analysis.gesture);
  }
});

characters.init();

async function boot() {
  ui.bootProgress(18, "media");
  try {
    await tracker.init();
    ui.bootProgress(60, "media");
    ui.bootProgress(72, "track");
    ui.setVisionState("READY");
    ui.bootProgress(100, "camera");
    setTimeout(() => ui.finishBoot(), 450);
  } catch (error) {
    ui.bootProgress(100, "media");
    ui.finishBoot();
    ui.showError("VISION ENGINE OFFLINE", error?.message || "MediaPipe could not be loaded. Check your internet connection and retry.");
  }
}

async function toggleCamera() {
  if (camera.active) {
    camera.stop();
    tracker.reset();
    ui.updateTracking(null, null);
  } else {
    try {
      ui.bootProgress(82, "camera");
      await camera.start();
      ui.setCameraState("ONLINE");
      ui.bootProgress(100, "camera");
      tracker.start();
    } catch {}
  }
}

ui.bind({
  camera: toggleCamera,
  tracking: enabled => {
    tracker.enabled = enabled;
    if (!enabled) tracker.reset();
  },
  landmarks: enabled => tracker.showLandmarks = enabled,
  mirror: enabled => {
    camera.mirrored = enabled;
    video.classList.toggle("mirrored", enabled);
  },
  fullscreen: () => ui.fullscreen(),
  retry: toggleCamera,
  selectCharacter: id => characters.select(id)
});

window.addEventListener("keydown", event => {
  if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
  const key = event.key.toLowerCase();
  if (key === "c") toggleCamera();
  if (key === "l") ui.toggleControl("landmarks");
  if (key === "m") ui.toggleControl("mirror");
  if (key === "f") ui.fullscreen();
});

setInterval(() => ui.updateClock(), 1000);
ui.updateClock();
boot();

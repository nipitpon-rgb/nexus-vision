export class CameraController {
  constructor(video, hooks = {}) {
    this.video = video;
    this.hooks = hooks;
    this.stream = null;
    this.active = false;
    this.mirrored = true;
  }

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("This browser does not support webcam access.");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 60, max: 60 }
      },
      audio: false
    });

    this.video.srcObject = this.stream;
    await this.video.play();
    this.active = true;
    this.hooks.onState?.("ONLINE");
  }

  stop() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.video.srcObject = null;
    this.active = false;
    this.hooks.onState?.("OFFLINE");
  }

  get resolution() {
    return `${this.video.videoWidth || 0} × ${this.video.videoHeight || 0}`;
  }
}

export class UIController {
  constructor() {
    this.trackingEnabled = true;
    this.controls = {camera:true,tracking:true,landmarks:true,mirror:true};
    this.$ = selector => document.querySelector(selector);
  }

  bind(actions) {
    this.actions = actions;
    this.$("#startCameraBtn").onclick = actions.camera;
    this.$("#cameraToggle").onclick = () => { this.toggleControl("camera"); actions.camera(); };
    this.$("#trackingToggle").onclick = () => { this.toggleControl("tracking"); actions.tracking(this.controls.tracking); };
    this.$("#landmarkToggle").onclick = () => { this.toggleControl("landmarks"); actions.landmarks(this.controls.landmarks); };
    this.$("#mirrorToggle").onclick = () => { this.toggleControl("mirror"); actions.mirror(this.controls.mirror); };
    this.$("#fullscreenBtn").onclick = actions.fullscreen;
    this.$("#retryBtn").onclick = () => { this.hideError(); actions.retry(); };
    this.$("#minimizeBtn").onclick = () => document.body.classList.toggle("focus-mode");
    this.$("#maximizeBtn").onclick = actions.fullscreen;
    this.$("#closeBtn").onclick = () => this.showToast("CLOSE REQUEST RECEIVED");
  }

  renderCharacters(characters, selectedId) {
    this.$("#characterList").innerHTML = characters.map(c => `
      <button class="character-card ${c.id===selectedId?"active":""}" data-id="${c.id}" style="--accent:${c.accent}">
        <span class="avatar">${c.initial}</span>
        <span class="character-info"><strong>${c.name}</strong><span>${c.id}</span></span>
        <span class="character-status">${c.id===selectedId?"ACTIVE":"READY"}</span>
      </button>`).join("");

    this.$("#characterList").querySelectorAll(".character-card").forEach(card => {
      card.onclick = () => this.actions.selectCharacter(card.dataset.id);
    });
  }

  setCharacter(c) {
    this.$("#experienceHeading").textContent = `${c.name} / ${c.id}`;
    this.$("#detailAvatar").textContent = c.initial;
    this.$("#detailAvatar").style.borderColor = c.accent;
    this.$("#detailName").textContent = c.name;
    this.$("#detailId").textContent = c.id;
    this.$("#characterState").textContent = "ACTIVE";
  }

  setReaction(reaction) {
    this.$("#characterReaction").textContent = reaction;
    const el = this.$("#reaction");
    el.textContent = reaction;
    el.classList.add("show");
    clearTimeout(this.reactionTimer);
    this.reactionTimer = setTimeout(() => el.classList.remove("show"), 800);
  }

  setCameraState(state) {
    const online = state === "ONLINE";
    this.$("#cameraState").textContent = online ? "CAMERA ACTIVE" : "CAMERA OFFLINE";
    this.$("#statusCamera").textContent = online ? "ONLINE" : "OFFLINE";
    this.$("#statusCamera").classList.toggle("online", online);
    this.$("#cameraPlaceholder").style.display = online ? "none" : "flex";
    this.$("#systemStatus").textContent = online ? "SYSTEM ONLINE / CAMERA LINKED" : "SYSTEM ONLINE";
  }

  setVisionState(state) {
    this.$("#statusMediaPipe").textContent = state === "READY" || state === "TRACKING" ? "ACTIVE" : state;
    this.$("#statusTracking").textContent = state === "TRACKING" ? "STABLE" : "IDLE";
  }

  updateTracking(result, analysis) {
    const hands = analysis?.hands || 0;
    const gesture = analysis?.gesture || "NONE";
    const confidence = analysis?.confidence || 0;
    const first = analysis?.handData?.[0];

    this.$("#handsCount").textContent = hands;
    this.$("#statusHands").textContent = hands;
    this.$("#fps").textContent = window.__nexusFps ? Math.round(window.__nexusFps) : "—";

    if (!hands) {
      this.$("#detectionText").textContent = "NO HAND DETECTED";
      this.$("#gestureName").textContent = "—";
      this.$("#panelGesture").textContent = "—";
      this.$("#confidence").textContent = "—";
      this.$("#panelConfidence").textContent = "—";
      this.$("#confidenceBar").style.width = "0%";
      this.$("#position").textContent = "—";
      return;
    }

    this.$("#detectionText").textContent = "HAND DETECTED";
    this.$("#gestureName").textContent = gesture;
    this.$("#panelGesture").textContent = gesture;
    this.$("#confidence").textContent = `${(confidence*100).toFixed(1)}%`;
    this.$("#panelConfidence").textContent = `${(confidence*100).toFixed(1)}%`;
    this.$("#confidenceBar").style.width = `${Math.min(100, confidence*100)}%`;
    this.$("#position").textContent = `${first.x.toFixed(2)} / ${first.y.toFixed(2)}`;
  }

  toggleControl(name) {
    this.controls[name] = !this.controls[name];
    const map = {camera:"#cameraToggle",tracking:"#trackingToggle",landmarks:"#landmarkToggle",mirror:"#mirrorToggle"};
    const el = this.$(map[name]);
    el.classList.toggle("active", this.controls[name]);
    if (name === "tracking") this.trackingEnabled = this.controls[name];
  }

  updateClock() {
    const now = new Date();
    this.$("#clock").textContent = now.toLocaleTimeString("en-GB");
  }

  bootProgress(value, step) {
    this.$("#bootProgress").style.width = `${value}%`;
    if (step) this.$(`#boot${step[0].toUpperCase()+step.slice(1)}`)?.classList.add("done");
  }

  finishBoot() {
    this.$("#loading").classList.add("hidden");
  }

  fullscreen() {
    const target = document.documentElement;
    if (!document.fullscreenElement) target.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  showError(title, message) {
    this.$("#errorTitle").textContent = title;
    this.$("#errorMessage").textContent = message;
    this.$("#errorModal").classList.remove("hidden");
  }

  hideError() { this.$("#errorModal").classList.add("hidden"); }

  showToast(message) {
    const toast = this.$("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }
}

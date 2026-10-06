export class GestureEngine {
  constructor() {
    this.lastGesture = "NONE";
    this.stableGesture = "NONE";
    this.streak = 0;
  }

  analyze(result) {
    const hands = result?.landmarks || [];
    if (!hands.length) {
      this.lastGesture = "NONE";
      this.stableGesture = "NONE";
      this.streak = 0;
      return {gesture:"NONE", confidence:0, hands:0, handData:[]};
    }

    const handData = hands.map((lm, index) => {
      const handedness = result.handednesses?.[index]?.[0]?.categoryName || "Hand";
      return {
        label: handedness,
        confidence: result.handednesses?.[index]?.[0]?.score || 0,
        x: lm[9]?.x || 0,
        y: lm[9]?.y || 0,
        landmarks: lm
      };
    });

    const primary = handData[0];
    const gesture = this.classify(primary.landmarks);

    if (gesture === this.lastGesture) this.streak++;
    else { this.lastGesture = gesture; this.streak = 0; }

    if (this.streak >= 2) this.stableGesture = gesture;

    return {
      gesture: this.stableGesture,
      confidence: primary.confidence,
      hands: hands.length,
      handData
    };
  }

  classify(lm) {
    const dist = (a,b) => Math.hypot(lm[a].x-lm[b].x, lm[a].y-lm[b].y);
    const angle = (a,b,c) => {
      const ab = [lm[a].x-lm[b].x,lm[a].y-lm[b].y];
      const cb = [lm[c].x-lm[b].x,lm[c].y-lm[b].y];
      const dot = ab[0]*cb[0]+ab[1]*cb[1];
      const mag = Math.hypot(...ab)*Math.hypot(...cb) || 1;
      return Math.acos(Math.max(-1,Math.min(1,dot/mag))) * 180/Math.PI;
    };

    const fingers = [
      [5,6,8],[9,10,12],[13,14,16],[17,18,20]
    ].map(([m,p,t]) => angle(m,p,t) > 155);

    const thumb = angle(2,3,4) > 145;
    const extended = [thumb,...fingers];
    const count = extended.filter(Boolean).length;

    const pinch = dist(4,8) < dist(5,9) * .55;
    if (pinch && count >= 2) return "OK";
    if (count === 0) return "FIST";
    if (count === 5) return "OPEN PALM";
    if (thumb && !fingers[0] && !fingers[1] && !fingers[2] && !fingers[3]) {
      return lm[4].y < lm[3].y ? "THUMB UP" : "THUMB DOWN";
    }
    if (!thumb && fingers[0] && !fingers[1] && !fingers[2] && !fingers[3]) return "POINT";
    if (!thumb && fingers[0] && fingers[1] && !fingers[2] && !fingers[3]) return "VICTORY";
    return "TRACKING";
  }
}

# NEXUS VISION

เว็บไซต์ HTML/CSS/JavaScript สำหรับ Real-time Hand Tracking ด้วย MediaPipe Hand Landmarker

## โครงสร้าง

- `index.html` — หน้าเว็บ
- `css/style.css` — Design System / Responsive UI
- `js/main.js` — Application orchestration
- `js/camera.js` — Webcam lifecycle
- `js/mediapipe.js` — MediaPipe Hand Landmarker + Canvas
- `js/gestures.js` — Gesture classification
- `js/characters.js` — Character system
- `js/ui.js` — UI state / interactions

## วิธีรัน

ไม่ควรเปิด `index.html` ด้วย `file://` เพราะ Webcam และ ES Modules ต้องการ secure context / local server

ใช้ VS Code + Live Server หรือรัน:

```bash
python -m http.server 5500
```

แล้วเปิด:

`http://localhost:5500`

## หมายเหตุ

ตัวระบบโหลด MediaPipe Tasks Vision และโมเดล Hand Landmarker จาก CDN/Google Storage จึงต้องมีอินเทอร์เน็ตในครั้งแรก

Keyboard:
- C = Camera
- L = Landmarks
- M = Mirror
- F = Fullscreen

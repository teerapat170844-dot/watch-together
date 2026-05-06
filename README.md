# Watch Together 🎬

ดู YouTube พร้อมกันแบบ real-time กับเพื่อน — sync ทุก 2 วินาที

## วิธีติดตั้ง

### 1. ติดตั้ง dependencies (ครั้งเดียว)
```powershell
npm install
```

### 2. รัน server
```powershell
node server.js
```

ถ้าเห็น `Server running on http://localhost:3001` = พร้อมใช้

### 3. เปิดเว็บ
Chrome → `http://localhost:3001`

## ฟีเจอร์

- 🚪 **เข้าห้อง / ✨ สร้างห้อง** แยกกันชัดเจน
- 🎮 ทุกคนคุม play / pause / seek ได้เท่าเทียม
- 🎬 ทุกคนเปลี่ยนวิดีโอ YouTube ได้อิสระ
- 👑 ผู้สร้างห้องเป็น time-sync authority (กัน drift)
- 👥 รายชื่อสมาชิกแบบ real-time + toast แจ้งเข้า/ออก
- 🚪 ปุ่มออกจากห้องพร้อม confirm modal
- 📱 PWA — ติดตั้งเป็นแอปบนมือถือ/desktop ได้

## ใช้กับเพื่อน (ภายนอกบ้าน)

```powershell
npx ngrok http 3001
```

จะได้ URL `https://xxx.ngrok-free.app` — ส่งให้เพื่อนเข้าได้เลย พร้อม HTTPS สำหรับติดตั้ง PWA

## โครงสร้าง

```
watch_together_project/
├── server.js              ← Socket.IO server (Node.js)
├── package.json           ← dependencies
└── public/
    ├── index.html         ← UI หลัก (Lobby + Room views)
    ├── manifest.json      ← PWA manifest
    ├── service-worker.js  ← Service Worker (offline cache)
    └── icons/             ← PWA icons (192, 512, maskable, apple)
```

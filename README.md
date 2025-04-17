# 📖 PraiseCue

**PraiseCue** is a lightweight local-network presentation tool for displaying Bible verses, worship songs, and announcements on screens around your church or gathering.

- Built with **React** (frontend) and **Node.js + SQLite** (backend)
- Uses **Socket.IO** for real-time syncing between controller and displays
- No cloud, no setup — just run it on your local machine and access it via LAN

---

## 📍 Local Access

Once running, visit the following from any device on your network:

- **Controller**:  
  `http://192.168.1.1/controller`

- **Displays**:  
  `http://192.168.1.1/display/1`, `.../2`, etc.

> Replace `192.168.1.1` with your actual local IP if different.

---

## 🚀 Getting Started

```bash
git clone https://github.com/yourusername/praisecue.git
cd praisecue
npm install
```

## Run Front & Backend (uses concurrently)
```bash
npm run dev
```

## Run Backend separately
```bash
cd server
npm run dev
```

## Run Frontend separately on Port 80 (after setcap)
```bash
cd client
PORT=80 HOST=0.0.0.0 npm start
```

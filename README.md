# Stereo Indicators v2.5
<img width="1471" height="556" alt="sl" src="https://github.com/user-attachments/assets/1a70688d-8ef4-4e6e-878a-bcbd0c49c90f" />

**Stereo Indicators** is a high-performance, real-time stereo audio peak meter for the browser, designed for **fm-dx-webserver**.  
It displays **Left & Right channel levels** using advanced **gradient rendering**, **dot-based visual modes**, **peak indicators**, and a fully configurable **Settings Panel**.

---

## ✨ Features (v2.5)

### 🎚 Core Meter Features
- Real-time stereo audio visualization (Left & Right)
- Continuous **low → mid → high gradient colors**
- **Peak indicator** with cinematic decay
- Smooth animations with natural response
- Automatic **theme color inheritance**
- Disabled automatically on mobile devices

### 🎛 New Settings Panel (Sidebar UI)
- **Glow Intensity** (0–20)
- **Audio Response Controls**
  - Peak Hold (ms)
  - Attack Speed
  - Release Speed
  - Gain (dB)
- **Bar Style Selector**
- **Theme Selector**
- All values are **persisted via LocalStorage**

### 🎨 Advanced Render Modes
- `simple` — Gradient bar
- `segment` — Segmented bars
- `circledots` — Continuous gradient dots with per-dot glow
- `matrixdots` — Dual-row matrix dots
- `pillars` — Fixed triangular pillars with adaptive glow
- `beveled` — 3D beveled bars
- `soft` — Feathered glow bars

### 🌟 Glow Engine (v2.1)
- **Color-adaptive glow** following the active gradient
- **Ultra-soft cinematic decay**
- No destructive over-glow at low values
- Independent glow systems for:
  - Bars
  - Circle dots
  - Matrix dots
  - Triangle pillars

---

## 📥 Installation

1. Download:
   - `stereoindicators.js`
   - `/StereoIndicators/stereoindicators.js`

2. Place the files into the `/plugins/` directory of your **fm-dx-webserver** installation.

3. Restart the **fm-dx-webserver**.

4. Activate the plugin from the **Admin Panel**.

---

## 🖥 Browser Support

- **Desktop:** Chrome, Firefox, Edge, Safari  
- **Mobile:** Disabled

---

## 🔁 Theme Compatibility

The plugin supports **automatic theme inheritance** and dynamically adapts to:
- Low color
- Mid color
- High color  
from the active **fm-dx-webserver theme**.

---

## 🧠 Technology & Credits

- **Original Plugin Author:** :contentReference[oaicite:2]{index=2}  
- **Visual Engine Refactor, Settings UI, Glow System, Dot Styles & Pillars (v2.1):** **MCelliotG**  
  https://github.com/MCelliotG

- **Audio Stream Method Inspiration:**  
  Based on the streaming approach used in the **Peakmeter** plugin by **:contentReference[oaicite:3]{index=3}**

- **Development & Documentation Assistance:**  
  :contentReference[oaicite:4]{index=4}

---

## 📄 License & Usage

This project is provided **as-is**, free for **personal and non-commercial use**.  
Attribution is appreciated when redistributing or modifying.

---

## ✅ Version

**Current Version:** `2.1`  
For a full history of changes, see `CHANGELOG.md`.

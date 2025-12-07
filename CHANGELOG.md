# Changelog

## [2.1] — Visual Engine & Settings Overhaul (Mod by MCelliotG)
**Release date:** 2025-12-07

### Added
- New **Settings Panel (Sidebar UI)**:
  - Glow Intensity control (0–20)
  - Audio Response controls:
    - Peak Hold (ms)
    - Attack Speed
    - Release Speed
    - Gain (dB)
  - Bar Style selector
  - Theme selector
- New dot-based render modes:
  - `circledots` (continuous gradient sampling with per-dot glow)
  - `matrixdots` (dual-row matrix dots with soft glow)
- Advanced **color-adaptive glow engine**:
  - Glow dynamically follows the active gradient (low → mid → high)
  - No more single-color high-only glow
- **Cinematic peak & glow decay** with smooth fade-out (0.92 factor)
- New **Triangle Pillars (fixed silhouette)** rendering:
  - Stable triangular contour
  - Gradient fills only inside the triangle
  - Independent ultra-soft adaptive glow (non-destructive)
- Improved **theme inheritance compatibility** with automatic FM-DX themes

### Improved
- Global glow behavior rescaled:
  - From value 1 now starts almost imperceptible
  - Progressive, natural build-up up to 20
- Dot-based styles now use:
  - Offscreen gradient sampling for perfect color accuracy
  - Independent glow logic (not shared with bar styles)
- Peak rendering refined for all styles
- Visual consistency across all bar styles
- Settings values now persist via LocalStorage (hardened sanitizer)

### Fixed
- Overpowering glow at low values (1–3)
- Rectangular glow artifacts on triangle pillars
- Color clipping on high-intensity glow
- Visual flicker during near-silence transitions
- Incorrect slider rendering in some browsers

### Performance
- Glow logic optimized for:
  - Zero reflow
  - Minimal canvas overdraw
  - No additional animation loops
- No audio pipeline interference
- Safe for continuous 60 FPS operation

### Attribution
- Original plugin: **Marsel90**
- Visual engine refactor, glow system, dot styles, triangle pillars & settings UI: **MCelliotG**

---

## [0.1] — Initial Release (Marsel90)
- Basic stereo level indicators
- Simple gradient bars
- Initial glow implementation

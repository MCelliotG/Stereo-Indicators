// Stereo Indicators v2.5 — Portrait fully hides meter blocks + '|' scale fix (SAFE PATCH)
// ============================================================
(() => {
  // ============================================================
  // STEREO INDICATORS — FULL HARDENED VERSION
  // THEME ENGINE • SETTINGS UI • RENDER ENGINE • AUDIO ENGINE
  // ============================================================

  // ─────────────────────────────────────────
  // GLOBAL HARDENED CONSTANTS
  // ─────────────────────────────────────────

  const VALID_THEMES = [
    "automatic",
    "aegean",
    "aurora",
    "emerald",
    "escapade",
    "goldenbrown",
    "iceblue",
    "neonlights",
    "pastel",
    "prism",
    "redvelvet",
    "retrospect",
    "secretgarden",
    "solar",
    "spaceship",
    "tangerine",
    "vesper",
    "vintage"
  ];

  const VALID_STYLES = [
    "simple",
    "segment",
    "circledots",
    "matrixdots",
    "pillars",
    "beveled",
    "soft"
  ];

  const STORAGE_ENABLE = "stereo_indicators_enabled_state";
  const STORAGE_THEME = "STEREO_THEME";
  const STORAGE_GLOW = "STEREO_GLOW";
  const STORAGE_BARSTYLE = "STEREO_BAR_STYLE";

  // ─────────────────────────────────────────
  // HARDENED LOCAL STORAGE HELPERS
  // ─────────────────────────────────────────

  function safeLSGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("[StereoIndicators] localStorage.getItem failed:", key, e);
      return null;
    }
  }

  function safeLSSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("[StereoIndicators] localStorage.setItem failed:", key, e);
    }
  }

  function safeLSRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("[StereoIndicators] localStorage.removeItem failed:", key, e);
    }
  }

  // ─────────────────────────────────────────
  // LOCAL STORAGE SANITIZER — PREVENTS LOCKOUT
  // ─────────────────────────────────────────

  (function sanitizeStorage() {
    try {
      // ENABLE FLAG
      let en = safeLSGet(STORAGE_ENABLE);
      if (en !== "true" && en !== "false") {
        safeLSSet(STORAGE_ENABLE, "true");
      }

      // THEME
      let th = safeLSGet(STORAGE_THEME);
      if (!VALID_THEMES.includes(th)) {
        safeLSSet(STORAGE_THEME, "automatic");
      }

      // GLOW
      let glRaw = safeLSGet(STORAGE_GLOW);
      let gl = parseInt(glRaw, 10);
      if (isNaN(gl) || gl < 0 || gl > 20) {
        safeLSSet(STORAGE_GLOW, "0");
      }

      // BAR STYLE
      let bs = safeLSGet(STORAGE_BARSTYLE);
      if (!VALID_STYLES.includes(bs)) {
        safeLSSet(STORAGE_BARSTYLE, "simple");
      }

      // Remove known legacy / deprecated keys
      [
        "theme",
        "defaultTheme",
        "stereo_theme",
        "stereo_theme_style",
        "stereo_indicator_theme",
        "glow"
      ].forEach((k) => safeLSRemove(k));
    } catch (e) {
      console.error("[StereoIndicators] sanitizeStorage failed:", e);
    }
  })();

  // ============================================================
  // PART 1 — THEME ENGINE • SETTINGS UI • CONFIG • STATE
  // ============================================================

  // ─────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────

  function darkenColor(rgb, percent) {
    try {
      const vals = rgb.match(/\d+/g).map(Number);
      const [r, g, b] = vals;
      const p = (100 - percent) / 100;
      return `rgb(${Math.round(r * p)},${Math.round(g * p)},${Math.round(
        b * p
      )})`;
    } catch (e) {
      console.error("[StereoIndicators] darkenColor failed:", e);
      return rgb;
    }
  }

  // RGB blend
  function mixRGB(c1, c2, ratio) {
    try {
      const a = c1.match(/\d+/g).map(Number);
      const b = c2.match(/\d+/g).map(Number);
      const lerp = (x, y) => Math.round(x * (1 - ratio) + ratio * y);
      return `rgb(${lerp(a[0], b[0])}, ${lerp(a[1], b[1])}, ${lerp(
        a[2],
        b[2]
      )})`;
    } catch (e) {
      console.error("[StereoIndicators] mixRGB failed:", e);
      return c1;
    }
  }

  // Procedural high color (FM-DX inheritance)
  function deriveHighColor(main, bright) {
    try {
      const a = main.match(/\d+/g).map(Number);
      const b = bright.match(/\d+/g).map(Number);
      const diff = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      return `rgb(${Math.max(0, Math.min(255, b[0] + diff[0]))},
                ${Math.max(0, Math.min(255, b[1] + diff[1]))},
                ${Math.max(0, Math.min(255, b[2] + diff[2]))})`;
    } catch (e) {
      console.error("[StereoIndicators] deriveHighColor failed:", e);
      return bright;
    }
  }

  // ─────────────────────────────────────────
  // THEME ENGINE — FM-DX INHERITANCE + MANUAL PRESETS
  // ─────────────────────────────────────────

  function getFmDxThemeTriple() {
    try {
      const themeName = safeLSGet("theme") || safeLSGet("defaultTheme");
      if (!themeName) return null;

      if (typeof themes === "undefined" || !themes) return null;
      const triple = themes[themeName];
      if (!Array.isArray(triple) || triple.length < 2) return null;

      return triple;
    } catch (e) {
      console.error("[StereoIndicators] getFmDxThemeTriple failed:", e);
      return null;
    }
  }

  const THEME_REGISTRY = {
    automatic: () => {
      try {
        const triple = getFmDxThemeTriple();
        if (!triple) {
          return THEME_REGISTRY.vesper;
        }

        const [main, mainBright, textColor] = triple;
        const high = deriveHighColor(main, mainBright);

        return {
          name: "automatic",
          colors: {
            low: main,
            mid: mainBright,
            high: high,
            peak: textColor || mainBright
          }
        };
      } catch (e) {
        console.error("[StereoIndicators] automatic theme failed:", e);
        return THEME_REGISTRY.vesper;
      }
    },

    aurora: {
      name: "aurora",
      colors: {
        low: "hsl(333, 100%, 65%)",
        mid: "hsl(75, 91%, 66%)",
        high: "hsl(195, 100%, 50%)",
        peak: "hsl(60, 100%, 82%)"
      }
    },
    
    aegean: {
      name: "aegean",
      colors: {
        low: "hsl(229, 100%, 36%)",
        mid: "hsl(226, 100%, 50%)",
        high: "hsl(24, 100%, 62%)",
        peak: "hsl(48, 48%, 90%)"
      }
    },
    
    emerald: {
      name: "emerald",
      colors: {
        low: "hsl(128, 100%, 25%)",
        mid: "hsl(132, 100%, 50%)",
        high: "hsl(156, 100%, 50%)",
        peak: "hsl(120, 100%, 80%)"
      }
    },
    
    escapade: {
      name: "escapade",
      colors: {
        low: "hsl(276, 100%, 19%)",
        mid: "hsl(287, 100%, 50%)",
        high: "hsl(316, 100%, 50%)",
        peak: "hsl(288, 100%, 86%)"
      }
    },
    
    goldenbrown: {
      name: "goldenbrown",
      colors: {
        low: "hsl(28, 44%, 33%)",
        mid: "hsl(34, 73%, 42%)",
        high: "hsl(36, 100%, 50%)",
        peak: "hsl(41, 100%, 72%)"
      }
    },
    
    iceblue: {
      name: "iceblue",
      colors: {
        low: "hsl(182, 100%, 50%)",
        mid: "hsl(210, 100%, 64%)",
        high: "hsl(222, 100%, 69%)",
        peak: "hsl(187, 100%, 86%)"
      }
    },
    
    neonlights: {
      name: "neonlights",
      colors: {
        low: "hsl(250, 53%, 46%)",
        mid: "hsl(277, 67%, 67%)",
        high: "hsl(96, 57%, 76%)",
        peak: "hsl(38, 90%, 60%)"
      }
    },
    
    pastel: {
      name: "pastel",
      colors: {
        low: "hsl(332, 88%, 73%)",
        mid: "hsl(0, 67%, 93%)",
        high: "hsl(204, 90%, 80%)",
        peak: "hsl(136, 100%, 97%)"
      }
    },
    
    prism: {
      name: "prism",
      colors: {
        low: "hsl(212, 100%, 50%)",
        mid: "hsl(61, 95%, 71%)",
        high: "hsl(338, 100%, 50%)",
        peak: "hsl(159, 100%, 44%)"
      }
    },
    
    redvelvet: {
      name: "redvelvet",
      colors: {
        low: "hsl(0, 100%, 33%)",
        mid: "hsl(0, 100%, 53%)",
        high: "hsl(0, 100%, 65%)",
        peak: "hsl(0, 100%, 84%)"
      }
    },
    
    retrospect: {
      name: "retrospect",
      colors: {
        low: "hsl(223, 63%, 19%)",
        mid: "hsl(28, 94%, 54%)",
        high: "hsl(71, 41%, 73%)",
        peak: "hsl(0, 0%, 93%)"
      }
    },

    secretgarden: {
      name: "secretgarden",
      colors: {
        low: "hsl(262, 50%, 32%)",
        mid: "hsl(282, 100%, 61%)",
        high: "hsl(44, 91%, 54%)",
        peak: "hsl(352, 100%, 67%)"
      }
    },
        
    solar: {
      name: "solar",
      colors: {
        low: "hsl(40, 100%, 57%)",
        mid: "hsl(7, 97%, 38%)",
        high: "hsl(51, 90%, 51%)",
        peak: "hsl(53, 59%, 64%)"
      }
    },
    
    spaceship: {
      name: "spaceship",
      colors: {
        low: "hsl(228, 85%, 13%)",
        mid: "hsl(0, 100%, 43%)",
        high: "hsl(0, 100%, 61%)",
        peak: "hsl(213, 100%, 17%)"
      }
    },
    
    tangerine: {
      name: "tangerine",
      colors: {
        low: "hsl(0, 100%, 41%)",
        mid: "hsl(28, 100%, 50%)",
        high: "hsl(41, 100%, 48%)",
        peak: "hsl(42, 100%, 73%)"
      }
    },
    
    vesper: {
      name: "vesper",
      colors: {
        low: "hsl(28, 97.6%, 50%)",
        mid: "hsl(274, 97.6%, 50%)",
        high: "hsl(181.9, 97.6%, 50%)",
        peak: "hsl(0, 0%, 100%)"
      }
    },
    
    vintage: {
      name: "vintage",
      colors: {
        low: "hsl(38, 26%, 47%)",
        mid: "hsl(35, 43%, 78%)",
        high: "hsl(55, 40%, 76%)",
        peak: "hsl(69, 22%, 67%)"
      }
    }
  };

  function loadActiveTheme() {
    try {
      const storedRaw = safeLSGet(STORAGE_THEME);
      const stored =
        typeof storedRaw === "string" && storedRaw.trim()
          ? storedRaw
          : "automatic";

      if (stored === "automatic") {
        const auto = THEME_REGISTRY.automatic();
        if (auto && auto.colors) return auto;
      }

      if (THEME_REGISTRY[stored]) {
        return THEME_REGISTRY[stored];
      }
    } catch (e) {
      console.error("[StereoIndicators] loadActiveTheme failed:", e);
    }

    return THEME_REGISTRY.vesper;
  }

  let ACTIVE_THEME = loadActiveTheme();

  try {
    new MutationObserver(() => {
      try {
        const sel = safeLSGet(STORAGE_THEME) || "automatic";
        if (sel === "automatic") {
          ACTIVE_THEME = THEME_REGISTRY.automatic();
        }
      } catch (e) {
        console.error(
          "[StereoIndicators] theme MutationObserver callback failed:",
          e
        );
      }
    }).observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class", "style"]
    });
  } catch (e) {
    console.error("[StereoIndicators] theme MutationObserver init failed:", e);
  }

  // ─────────────────────────────────────────
  // CONFIG + STATE
  // ─────────────────────────────────────────

  const CONFIG = {
    audio: {
      minThreshold: 0.0005,
      riseRate: 1.4,
      amplification: 0.67,
      bassReduction: -2,
      highPassCutoff: 1200,
      lowPassCutoff: 2000,
      attackSpeed: 0.4,
      releaseSpeed: 0.1,
      peakHoldMs: 1000,
      peakDecayDbPerFrame: 0.7,
      minDb: -40,
      maxDb: +3,
      dbGain: 16
    },

    display: {
      glowIntensity: 0,

      barStyle: (() => {
        const raw = safeLSGet(STORAGE_BARSTYLE) || "simple";
        return VALID_STYLES.includes(raw) ? raw : "simple";
      })(),

      dimensions: {
        barHeight: 20,
        spacing: 10,
        labelLeft: 5,
        canvasLeft: 25,
        borderRadius: "20px",
        minTileWidth: 320,
        tileWidthPercent: 32.9
      },

      defaultTitle: "STEREO LEVELS"
    }
  };

  const INNER_BASE_TOP = 22;
  const WRAPPER_EXTRA = 50;

  const WRAPPER_HEIGHT =
    CONFIG.display.dimensions.barHeight * 2 +
    CONFIG.display.dimensions.spacing +
    WRAPPER_EXTRA;

  const STATE = {
    audio: {
      context: null,
      splitter: null,
      analyserLeft: null,
      analyserRight: null,
      bassFilter: null,
      highPassFilter: null,
      lowPassFilter: null,
      source: null,
      dataLeft: null,
      dataRight: null
    },
    levels: {
      left: { smoothDb: -999, peakDb: -999 },
      right: { smoothDb: -999, peakDb: -999 }
    },
    dom: {
      container: null,
      title: null,
      contentWrapper: null,
      canvas: null,
      ctx: null,
      labels: { left: null, right: null },
      scales: { left: null, right: null }
    },
    peakTimeout: null
  };

  // ─────────────────────────────────────────
  // SETTINGS UI  (ENABLE + THEME + GLOW + BAR STYLE)
  // ─────────────────────────────────────────

  function isStereoEnabled() {
    try {
      const v = safeLSGet(STORAGE_ENABLE);
      return v === null ? true : v === "true";
    } catch (e) {
      console.error("[StereoIndicators] isStereoEnabled failed:", e);
      return true;
    }
  }

  function addStereoIndicatorsToggle() {
    try {
      const anchor = document.getElementById("imperial-units");
      if (!anchor) return;

      const id = "stereo-toggle";

      // Enable switch
      const wrapper = document.createElement("div");
      wrapper.className = "form-group";
      wrapper.innerHTML = `
        <div class="switch" style="display:flex; align-items:center;">
          <input type="checkbox" id="${id}">
          <label for="${id}"></label>
          <span class="text-smaller text-uppercase text-bold color-4 p-10"
                style="white-space:nowrap; margin-left:0;">
            ENABLE STEREO INDICATORS
          </span>
        </div>
      `;

      const group = anchor.closest(".form-group") || anchor;
      group.insertAdjacentElement("afterend", wrapper);

      const cb = document.getElementById(id);
      cb.checked = isStereoEnabled();

      // ----------------------------------------
      // THEME SELECTOR
      // ----------------------------------------

      const themeDiv = document.createElement("div");
      themeDiv.className = "form-group";
      themeDiv.innerHTML = `
        <label class="form-label"><i class="fa-solid m-right-10"></i>STEREO INDICATORS THEME</label>
        <div class="dropdown">
          <input type="text" id="stereo-theme-input" class="form-control" readonly>
          <div id="stereo-theme-options" class="options">
            <div class="option" data-value="automatic">Automatic</div>
            <div class="option" data-value="aegean">Aegean</div>
            <div class="option" data-value="aurora">Aurora</div>
            <div class="option" data-value="emerald">Emerald</div>
            <div class="option" data-value="escapade">Escapade</div>
            <div class="option" data-value="goldenbrown">Golden Brown</div>
            <div class="option" data-value="iceblue">Ice Blue</div>
            <div class="option" data-value="neonlights">Neon Lights</div>
            <div class="option" data-value="pastel">Pastel</div>
            <div class="option" data-value="prism">Prism</div>
            <div class="option" data-value="redvelvet">Red Velvet</div>
            <div class="option" data-value="retrospect">Retrospect</div>
            <div class="option" data-value="secretgarden">Secret Garden</div>
            <div class="option" data-value="solar">Solar</div>
            <div class="option" data-value="spaceship">Spaceship</div>
            <div class="option" data-value="tangerine">Tangerine</div>
            <div class="option" data-value="vesper">Vesper</div>
            <div class="option" data-value="vintage">Vintage</div>
          </div>
        </div>
      `;

      wrapper.insertAdjacentElement("afterend", themeDiv);

      const themeInput = document.getElementById("stereo-theme-input");
      const savedThemeRaw = safeLSGet(STORAGE_THEME) || "automatic";
      const savedTheme = VALID_THEMES.includes(savedThemeRaw)
        ? savedThemeRaw
        : "automatic";

      themeInput.value =
        savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1);

      themeInput.onclick = () => {
        const opts = document.getElementById("stereo-theme-options");
        if (opts) opts.classList.toggle("opened");
      };

      document
        .querySelectorAll("#stereo-theme-options .option")
        .forEach((opt) => {
          opt.onclick = () => {
            const val = opt.dataset.value;
            if (!VALID_THEMES.includes(val)) return;

            themeInput.value = opt.textContent;
            safeLSSet(STORAGE_THEME, val);
            ACTIVE_THEME =
              val === "automatic"
                ? THEME_REGISTRY.automatic()
                : THEME_REGISTRY[val];
            const opts = document.getElementById("stereo-theme-options");
            if (opts) opts.classList.remove("opened");
          };
        });

      // ----------------------------------------
      // BAR STYLE SELECTOR
      // ----------------------------------------

      const styleDiv = document.createElement("div");
      styleDiv.className = "form-group";
      styleDiv.innerHTML = `
        <label class="form-label"><i class="fa-solid m-right-10"></i>STEREO BARS STYLE</label>
        <div class="dropdown">
          <input type="text" id="stereo-barstyle-input" class="form-control" readonly>
          <div id="stereo-barstyle-options" class="options">
            <div class="option" data-value="simple">Simple Gradient</div>
            <div class="option" data-value="segment">Segmented</div>
            <div class="option" data-value="circledots">Circle Dots</div>
            <div class="option" data-value="matrixdots">Matrix Dots</div>
            <div class="option" data-value="pillars">Pillars</div>
            <div class="option" data-value="beveled">Beveled 3D</div>
            <div class="option" data-value="soft">Soft Feathered</div>
          </div>
        </div>
      `;
      themeDiv.insertAdjacentElement("afterend", styleDiv);

      const styleInput = document.getElementById("stereo-barstyle-input");
      const savedStyle = CONFIG.display.barStyle;

      styleInput.value =
        {
          simple: "Simple Gradient",
          segment: "Segmented",
          circledots: "Circle Dots",
          matrixdots: "Matrix Dots",
          pillars: "Pillars",
          beveled: "Beveled 3D",
          soft: "Soft Feathered"
        }[savedStyle] || "Simple Gradient";

      styleInput.onclick = () => {
        const opts = document.getElementById("stereo-barstyle-options");
        if (opts) opts.classList.toggle("opened");
      };

      document
        .querySelectorAll("#stereo-barstyle-options .option")
        .forEach((opt) => {
          opt.onclick = () => {
            const val = opt.dataset.value;
            if (!VALID_STYLES.includes(val)) return;

            CONFIG.display.barStyle = val;
            safeLSSet(STORAGE_BARSTYLE, val);
            styleInput.value = opt.textContent;

            const opts = document.getElementById("stereo-barstyle-options");
            if (opts) opts.classList.remove("opened");
          };
        });

      // ----------------------------------------
      // GLOW SLIDER
      // ----------------------------------------

      const glowDiv = document.createElement("div");
      glowDiv.className = "form-group";
      glowDiv.innerHTML = `
        <label class="form-label"><i class="fa-solid m-right-10"></i>GLOW INTENSITY</label>

        <style>
  /* =====================================
     GLOW SLIDER
     ===================================== */
          #glow-slider {
            -webkit-appearance: none;
            appearance: none;

            width: 100%;
            min-width: 205px !important;
            height: 22px !important;

            border-radius: 22px;
            background: var(--color-1);
            border: 2px solid var(--color-3);
            cursor: pointer;
            outline: none;
          }

          #glow-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--color-5);
            cursor: pointer;
          }

          #glow-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--color-5);
            cursor: pointer;
          }

  /* ============================================
     AUDIO RESPONSE SLIDERS
     ============================================= */

          #peak-hold-slider,
          #attack-slider,
          #release-slider,
          #gain-slider {
            -webkit-appearance: none !important;
            appearance: none !important;

            width: 40% !important;
            min-width: 115px !important;
            height: 22px !important;

            border-radius: 22px !important;
            background: var(--color-1) !important;
            border: 2px solid var(--color-3) !important;
            cursor: pointer !important;
            outline: none !important;

            display: inline-block !important;
          }

          /* TRACK OVERRIDES (WebKit) */
          #peak-hold-slider::-webkit-slider-runnable-track,
          #attack-slider::-webkit-slider-runnable-track,
          #release-slider::-webkit-slider-runnable-track,
          #gain-slider::-webkit-slider-runnable-track {
            height: 22px !important;
            border-radius: 22px !important;
            background: var(--color-1) !important;
            border: 2px solid var(--color-3) !important;
          }

          /* TRACK OVERRIDES (Firefox) */
          #peak-hold-slider::-moz-range-track,
          #attack-slider::-moz-range-track,
          #release-slider::-moz-range-track,
          #gain-slider::-moz-range-track {
            height: 22px !important;
            border-radius: 22px !important;
            background: var(--color-1) !important;
            border: 2px solid var(--color-3) !important;
          }

          /* THUMB — full override */
          #peak-hold-slider::-webkit-slider-thumb,
          #attack-slider::-webkit-slider-thumb,
          #release-slider::-webkit-slider-thumb,
          #gain-slider::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            width: 20px !important;
            height: 20px !important;
            border-radius: 50% !important;
            background: var(--color-5) !important;
            cursor: pointer !important;
            margin-top: -1px !important;
          }

          #peak-hold-slider::-moz-range-thumb,
          #attack-slider::-moz-range-thumb,
          #release-slider::-moz-range-thumb,
          #gain-slider::-moz-range-thumb {
            width: 20px !important;
            height: 20px !important;
            border-radius: 50% !important;
            background: var(--color-5) !important;
            cursor: pointer !important;
          }

  /* ============================================================
     AUDIO RESPONSE ROW LAYOUT — compact, aligned columns
     ============================================================ */

          .audio-row {
            display: flex;
            align-items: center;
            gap: 4px !important;
            margin-top: 4px;
          }

          .audio-row span.text-small:first-child {
            min-width: 80px !important;
            text-align: left;
          }

          .audio-row input[type="range"] {
            flex: 1 1 auto !important;
            max-width: 80px !important;
          }

          .audio-row span.text-small:last-child {
            min-width: 35px !important;
            text-align: right;
          }
        </style>

        <div style="margin-top:6px; display:flex; align-items:center; gap:3px;">
          <input id="glow-slider" type="range" min="0" max="20" step="1" />
          <span id="glow-value" class="text-small"
                style="min-width:35px;"></span>
        </div>
      `;
      styleDiv.insertAdjacentElement("afterend", glowDiv);

      const slider = document.getElementById("glow-slider");
      const valBox = document.getElementById("glow-value");

      const savedGlowRaw = safeLSGet(STORAGE_GLOW) || "0";
      let savedGlow = parseInt(savedGlowRaw, 10);
      if (isNaN(savedGlow) || savedGlow < 0 || savedGlow > 20) {
        savedGlow = 0;
      }

      slider.value = String(savedGlow);
      valBox.textContent = String(savedGlow);
      CONFIG.display.glowIntensity = savedGlow;

      slider.oninput = () => {
        const v = parseInt(slider.value, 10);
        const clamped = isNaN(v) ? 0 : Math.max(0, Math.min(20, v));
        CONFIG.display.glowIntensity = clamped;
        valBox.textContent = String(clamped);
        safeLSSet(STORAGE_GLOW, String(clamped));
      };

      // ----------------------------------------
      // AUDIO RESPONSE PANEL
      // ----------------------------------------

      const audioDiv = document.createElement("div");
      audioDiv.className = "form-group";
      audioDiv.innerHTML = `
        <label class="form-label"><i class="fa-solid m-right-10"></i>AUDIO RESPONSE</label>

        <div style="margin-top:6px; display:flex; align-items:center; gap:10px;">
          <span class="text-small" style="min-width:80px; text-align:left;">Peak hold (ms)</span>
          <input id="peak-hold-slider" type="range" min="200" max="2000" step="50" />
          <span id="peak-hold-value" class="text-small"
                style="min-width:25px; text-align:right;"></span>
        </div>

        <div style="margin-top:4px; display:flex; align-items:center; gap:10px;">
          <span class="text-small" style="min-width:80px; text-align:left;">Attack speed</span>
          <input id="attack-slider" type="range" min="0.05" max="1.00" step="0.01" />
          <span id="attack-value" class="text-small"
                style="min-width:25px; text-align:right;"></span>
        </div>

        <div style="margin-top:4px; display:flex; align-items:center; gap:10px;">
          <span class="text-small" style="min-width:80px; text-align:left;">Release speed</span>
          <input id="release-slider" type="range" min="0.01" max="0.50" step="0.01" />
          <span id="release-value" class="text-small"
                style="min-width:25px; text-align:right;"></span>
        </div>

        <div style="margin-top:4px; display:flex; align-items:center; gap:10px;">
          <span class="text-small" style="min-width:80px; text-align:left;">Gain (dB)</span>
          <input id="gain-slider" type="range" min="0" max="24" step="1" />
          <span id="gain-value" class="text-small"
                style="min-width:25px; text-align:right;"></span>
        </div>
      `;
      glowDiv.insertAdjacentElement("afterend", audioDiv);

      // Peak hold
      const peakHoldSlider = document.getElementById("peak-hold-slider");
      const peakHoldValue  = document.getElementById("peak-hold-value");
      peakHoldSlider.value = CONFIG.audio.peakHoldMs;
      peakHoldValue.textContent = CONFIG.audio.peakHoldMs;
      peakHoldSlider.oninput = () => {
        const v = parseInt(peakHoldSlider.value, 10);
        peakHoldValue.textContent = v;
        CONFIG.audio.peakHoldMs = v;
      };

      // Attack
      const attackSlider = document.getElementById("attack-slider");
      const attackValue  = document.getElementById("attack-value");
      attackSlider.value = CONFIG.audio.attackSpeed;
      attackValue.textContent = Number(CONFIG.audio.attackSpeed).toFixed(2);
      attackSlider.oninput = () => {
        const v = parseFloat(attackSlider.value);
        attackValue.textContent = v.toFixed(2);
        CONFIG.audio.attackSpeed = v;
      };

      // Release
      const releaseSlider = document.getElementById("release-slider");
      const releaseValue  = document.getElementById("release-value");
      releaseSlider.value = CONFIG.audio.releaseSpeed;
      releaseValue.textContent = Number(CONFIG.audio.releaseSpeed).toFixed(2);
      releaseSlider.oninput = () => {
        const v = parseFloat(releaseSlider.value);
        releaseValue.textContent = v.toFixed(2);
        CONFIG.audio.releaseSpeed = v;
      };

      // Gain
      const gainSlider = document.getElementById("gain-slider");
      const gainValue  = document.getElementById("gain-value");
      gainSlider.value = CONFIG.audio.dbGain;
      gainValue.textContent = CONFIG.audio.dbGain;
      gainSlider.oninput = () => {
        const v = parseInt(gainSlider.value, 10);
        gainValue.textContent = v;
        CONFIG.audio.dbGain = v;
      };


      // SHOW / HIDE (extend with audio panel)
      function updateVisibility() {
        const enabled = isStereoEnabled();
        themeDiv.style.display = enabled ? "block" : "none";
        styleDiv.style.display = enabled ? "block" : "none";
        glowDiv.style.display = enabled ? "block" : "none";
        audioDiv.style.display = enabled ? "block" : "none";
      }
      updateVisibility();

      // Toggle handler
      cb.addEventListener("change", () => {
        safeLSSet(STORAGE_ENABLE, cb.checked ? "true" : "false");
        updateVisibility();
        window.location.reload();
      });

    } catch (e) {
      console.error("[StereoIndicators] addStereoIndicatorsToggle failed:", e);
    }
  }

  /* ============================================================
     PART 2 — ADVANCED RENDER ENGINE (ALL BAR STYLES + GLOW)
     ============================================================ */

  // ─────────────────────────────────────────
  // MAP DB → X ABSOLUTE POSITION
  // ─────────────────────────────────────────

  function mapDbToX(db, width) {
    const min = CONFIG.audio.minDb;
    const max = CONFIG.audio.maxDb;
    if (db < min) db = min;
    if (db > max) db = max;
    return ((db - min) / (max - min)) * width;
  }

  // ─────────────────────────────────────────
  // BASE GRADIENT BUILDER
  // ─────────────────────────────────────────

  function buildGradient(ctx, y, height, width) {
    const col = ACTIVE_THEME.colors;
    const g = ctx.createLinearGradient(0, y, width, y + height);
    g.addColorStop(0.0, col.low);
    g.addColorStop(0.55, col.mid);
    g.addColorStop(0.80, col.high);
    return g;
  }

  // ─────────────────────────────────────────
  // UNIVERSAL GLOW FOR BAR-TYPE STYLES
  // (Except the ones with their own glows)
  // ─────────────────────────────────────────

  function applyBarGlow(ctx, x, y, height) {
    const gInt = CONFIG.display.glowIntensity;
    if (gInt <= 0 || x <= 0) return;

    // NEW global soft curve
    const strength = Math.pow(gInt / 20, 1.5);

    ctx.save();
    ctx.shadowBlur = strength * 22;  // slightly reduced globally
    ctx.shadowColor = ACTIVE_THEME.colors.high;
    ctx.fillStyle = ACTIVE_THEME.colors.high;
    ctx.fillRect(0, y, x, height);
    ctx.restore();
  }

  /* ============================================================
     STYLE RENDERERS — 7 MODES
     ============================================================ */

  // ------------------------------------------------------------
  // 1) SIMPLE GRADIENT
  // ------------------------------------------------------------

  function renderSimple(ctx, levelX, peakX, y, height, width) {
    const grad = buildGradient(ctx, y, height, levelX);
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, levelX, height);

    ctx.fillStyle = ACTIVE_THEME.colors.peak;
    ctx.fillRect(peakX, y, 2, height);
  }

  // ------------------------------------------------------------
  // 2) SEGMENTED RECTANGLES
  // ------------------------------------------------------------

  function renderSegment(ctx, levelX, peakX, y, height, width) {
    const segW = Math.max(3, Math.floor(height / 1.7));
    const gap = 2;
    const grad = buildGradient(ctx, y, height, levelX);
    ctx.fillStyle = grad;

    for (let x = 0; x < levelX; x += segW + gap) {
      ctx.fillRect(x, y, segW, height);
    }

    ctx.fillStyle = ACTIVE_THEME.colors.peak;
    ctx.fillRect(peakX, y, 2, height);
  }

  // ------------------------------------------------------------
  // 3) Circle Dots — continuous gradient
  // ------------------------------------------------------------

  function renderCircledots(ctx, levelX, peakX, y, height, width) {
    const radius = height * 0.33 + 3;
    const gap = 4;

    // Offscreen gradient sampling
    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.floor(levelX));
    off.height = 1;
    const octx = off.getContext("2d");

    const g = octx.createLinearGradient(0, 0, off.width, 0);
    g.addColorStop(0.0, ACTIVE_THEME.colors.low);
    g.addColorStop(0.45, ACTIVE_THEME.colors.mid);
    g.addColorStop(0.77, ACTIVE_THEME.colors.high);
    octx.fillStyle = g;
    octx.fillRect(0, 0, off.width, 1);

    const sampleColorAt = (x) => {
      const ix = Math.min(off.width - 1, Math.max(0, Math.floor(x)));
      const d = octx.getImageData(ix, 0, 1, 1).data;
      return `rgb(${d[0]},${d[1]},${d[2]})`;
    };

    const centerY = y + height / 2;

    for (let x = radius; x < levelX; x += radius * 2 + gap) {
      const c = sampleColorAt(x);

      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      const glow = CONFIG.display.glowIntensity;
      if (glow > 0) {
        const s = Math.pow(glow / 20, 1.5);
        ctx.save();
        ctx.shadowBlur = s * 34;
        ctx.shadowColor = c;
        ctx.beginPath();
        ctx.arc(x, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.fillStyle = ACTIVE_THEME.colors.peak;
    ctx.fillRect(peakX, y, 2, height);
  }

  // ------------------------------------------------------------
  // 4) MATRIX dots — dual-row dots
  // ------------------------------------------------------------

  function renderMatrixdots(ctx, levelX, peakX, y, height, width) {
    const radius = height * 0.18;
    const gapX = radius * 2 + 4;

    const row1Y = y + height * 0.28;
    const row2Y = y + height * 0.72;

    // same gradient sampling as circledots
    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.floor(levelX));
    off.height = 1;
    const octx = off.getContext("2d");

    const g = octx.createLinearGradient(0, 0, off.width, 0);
    g.addColorStop(0.0, ACTIVE_THEME.colors.low);
    g.addColorStop(0.55, ACTIVE_THEME.colors.mid);
    g.addColorStop(0.80, ACTIVE_THEME.colors.high);
    octx.fillStyle = g;
    octx.fillRect(0, 0, off.width, 1);

    const sampleColorAt = (x) => {
      const ix = Math.min(off.width - 1, Math.max(0, Math.floor(x)));
      const d = octx.getImageData(ix, 0, 1, 1).data;
      return `rgb(${d[0]},${d[1]},${d[2]})`;
    };

    for (let x = radius; x < levelX; x += gapX) {
      const c = sampleColorAt(x);

      [row1Y, row2Y].forEach((centerY) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        const glow = CONFIG.display.glowIntensity;
        if (glow > 0) {
          const s = Math.pow(glow / 20, 1.5);
          ctx.save();
          ctx.shadowBlur = s * 30;
          ctx.shadowColor = c;
          ctx.beginPath();
          ctx.arc(x, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    }

    ctx.fillStyle = ACTIVE_THEME.colors.peak;
    ctx.fillRect(peakX, y, 2, height);
  }

  // ------------------------------------------------------------
  // 5) TRIANGLE PILLARS — fixed triangular silhouette + ultra-soft glow
  // ------------------------------------------------------------

  let pillarGlowAlpha = 0;

  function renderPillars(ctx, levelX, peakX, y, height, width) {
    if (width <= 0) return;

    const isLeft  = y < CONFIG.display.dimensions.barHeight;
    const topY    = y;
    const midY    = y + height * 0.5;
    const bottomY = y + height;

    // ---------------------------------------------------------
    // FIXED TRIANGULAR SILHOUETTE
    // ---------------------------------------------------------
    const triPath = new Path2D();

    if (isLeft) {
      // Left channel: tip στο mid, γεμίζει προς τα πάνω
      triPath.moveTo(0, midY);
      triPath.lineTo(width, topY);
      triPath.lineTo(width, bottomY);
    } else {
      // Right channel: mirror — γεμίζει προς τα κάτω
      triPath.moveTo(0, midY);
      triPath.lineTo(width, bottomY);
      triPath.lineTo(width, topY);
    }
    triPath.closePath();

    // ---------------------------------------------------------
    // FILL INSIDE TRIANGLE ONLY UP TO levelX
    // ---------------------------------------------------------
    ctx.save();
    ctx.clip(triPath);

    const fillX = Math.max(0, Math.min(width, levelX));

    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0.00, ACTIVE_THEME.colors.low);
    grad.addColorStop(0.55, ACTIVE_THEME.colors.mid);
    grad.addColorStop(0.80, ACTIVE_THEME.colors.high);

    ctx.fillStyle = grad;
    ctx.fillRect(0, topY, fillX, height);

    ctx.restore();

    // ---------------------------------------------------------
    // ULTRA-SOFT COLOR-ADAPTIVE GLOW
    // ---------------------------------------------------------
    const glow = CONFIG.display.glowIntensity;

    // Raise–hold–fade cinematic logic
    if (fillX > 2 && glow > 0) {
      pillarGlowAlpha = 1.0;
    } else {
      pillarGlowAlpha *= 0.92; // cinematic fade-out
    }

    if (pillarGlowAlpha > 0.01 && glow > 0) {
      // Color sample ~60% of length on mid-height
      const sampleX = Math.max(1, Math.min(width - 1, Math.floor(fillX * 0.60)));

      const off = document.createElement("canvas");
      off.width = width;
      off.height = 1;
      const octx = off.getContext("2d");

      const g = octx.createLinearGradient(0, 0, width, 0);
      g.addColorStop(0.0, ACTIVE_THEME.colors.low);
      g.addColorStop(0.55, ACTIVE_THEME.colors.mid);
      g.addColorStop(0.80, ACTIVE_THEME.colors.high);

      octx.fillStyle = g;
      octx.fillRect(0, 0, width, 1);

      const d = octx.getImageData(sampleX, 0, 1, 1).data;

      const n = glow / 20;
      const alpha = 0.16 * n * pillarGlowAlpha; // max ~0.16

      const glowColor = `rgba(${d[0]},${d[1]},${d[2]},${alpha})`;

      ctx.save();
      ctx.shadowBlur = (Math.pow(n, 2) * 16); // ήπιο blur
      ctx.shadowColor = glowColor;
      ctx.fillStyle   = glowColor;

      ctx.fill(triPath);
      ctx.restore();
    }

    // ---------------------------------------------------------
    // PEAK INDICATOR
    // ---------------------------------------------------------
    ctx.fillStyle = ACTIVE_THEME.colors.peak;
    ctx.fillRect(peakX, y, 2, height);
  }

  // ------------------------------------------------------------
  // 6) BEVELED 3D
  // ------------------------------------------------------------

  function renderBeveled(ctx, levelX, peakX, y, height, width) {
    const grad = buildGradient(ctx, y, height, levelX);
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, levelX, height);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, y, levelX, 2);

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(0, y + height - 2, levelX, 2);

    ctx.fillStyle = ACTIVE_THEME.colors.peak;
    ctx.fillRect(peakX, y, 2, height);
  }

  // ------------------------------------------------------------
  // 7) SOFT FEATHERED
  // ------------------------------------------------------------

  function renderSoft(ctx, levelX, peakX, y, height, width) {
    const innerY = y + 3;
    const innerH = height - 6;

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, y + 0.5, levelX - 1, height - 1);

    const grad = buildGradient(ctx, innerY, innerH, levelX);

    ctx.save();
    ctx.shadowBlur = Math.pow(CONFIG.display.glowIntensity / 20, 1.5) * 18;
    ctx.shadowColor = ACTIVE_THEME.colors.mid;
    ctx.fillStyle = grad;
    ctx.fillRect(0, innerY, levelX, innerH);
    ctx.restore();

    ctx.fillStyle = ACTIVE_THEME.colors.peak;
    ctx.fillRect(peakX, y, 2, height);
  }

  /* ============================================================
     MAIN RENDER SWITCH
     ============================================================ */

  function renderChannel(smoothDb, peakDb, y, width, height) {
    const ctx = STATE.dom.ctx;
    if (!ctx) return;

    const levelX = mapDbToX(smoothDb, width);
    const peakX = mapDbToX(peakDb, width);

    if (!["circledots", "matrixdots", "pillars"].includes(CONFIG.display.barStyle)) {
      applyBarGlow(ctx, levelX, y, height);
    }

    switch (CONFIG.display.barStyle) {
      case "simple":
        return renderSimple(ctx, levelX, peakX, y, height, width);
      case "segment":
        return renderSegment(ctx, levelX, peakX, y, height, width);
      case "circledots":
        return renderCircledots(ctx, levelX, peakX, y, height, width);
      case "matrixdots":
        return renderMatrixdots(ctx, levelX, peakX, y, height, width);
      case "pillars":
        return renderPillars(ctx, levelX, peakX, y, height, width);
      case "beveled":
        return renderBeveled(ctx, levelX, peakX, y, height, width);
      case "soft":
        return renderSoft(ctx, levelX, peakX, y, height, width);
      default:
        return renderSimple(ctx, levelX, peakX, y, height, width);
    }
  }

  /* ============================================================
     FULL CANVAS CLEAR + DRAW 2 BARS
     ============================================================ */

  function renderMeters() {
    const ctx = STATE.dom.ctx;
    if (!ctx) return;

    const width = STATE.dom.canvas.width;
    const height = CONFIG.display.dimensions.barHeight;

    ctx.clearRect(0, 0, width, STATE.dom.canvas.height);

    renderChannel(
      STATE.levels.left.smoothDb,
      STATE.levels.left.peakDb,
      0,
      width,
      height
    );

    renderChannel(
      STATE.levels.right.smoothDb,
      STATE.levels.right.peakDb,
      height + CONFIG.display.dimensions.spacing,
      width,
      height
    );
  }

  // ============================================================
  // PART 3 — DOM INITIALIZATION • AUDIO ENGINE • FINAL LOOP
  // ============================================================

  document.addEventListener("DOMContentLoaded", () => {
    try {
      // Build settings UI
      addStereoIndicatorsToggle();

      if (!isStereoEnabled()) return;

      // ============================================================
      // CONTAINER TILE
      // ============================================================

      STATE.dom.container = document.createElement("div");
      STATE.dom.container.className =
        "panel-33 hover-brighten no-bg-phone tooltip";
      STATE.dom.container.id = "stereo-indicators-container";
      STATE.dom.container.style.width =
        CONFIG.display.dimensions.tileWidthPercent + "%";
      STATE.dom.container.style.minWidth =
        CONFIG.display.dimensions.minTileWidth + "px";
      STATE.dom.container.style.borderRadius =
        CONFIG.display.dimensions.borderRadius;

      STATE.dom.container.setAttribute(
        "data-tooltip",
        "Stereo modulation L/R | Peaks"
      );

      // Title
      STATE.dom.title = document.createElement("h2");
      STATE.dom.title.textContent = CONFIG.display.defaultTitle;
      STATE.dom.title.style.userSelect = "none";
      STATE.dom.container.appendChild(STATE.dom.title);

      const ph = document.createElement("div");
      ph.className = "text-small text-gray hide-phone";
      STATE.dom.container.appendChild(ph);

      // Content wrapper
      STATE.dom.contentWrapper = document.createElement("div");
      STATE.dom.contentWrapper.style.cssText = `
        position:relative;
        margin-top:8px;
        height:${WRAPPER_HEIGHT}px;
      `;
      STATE.dom.container.appendChild(STATE.dom.contentWrapper);

      // Canvas
      STATE.dom.canvas = document.createElement("canvas");
      STATE.dom.canvas.style.cssText = `
        position:absolute;
        top:${INNER_BASE_TOP}px;
        left:${CONFIG.display.dimensions.canvasLeft}px;
        width:calc(100% - ${
          CONFIG.display.dimensions.canvasLeft + 5
        }px);
        height:${
          CONFIG.display.dimensions.barHeight * 2 +
          CONFIG.display.dimensions.spacing
        }px;
      `;
      STATE.dom.contentWrapper.appendChild(STATE.dom.canvas);

      // Labels L/R
      function createLabel(text, top) {
        const el = document.createElement("div");
        el.textContent = text;
        el.style.cssText = `
          position:absolute;
          left:${CONFIG.display.dimensions.labelLeft}px;
          top:${top + CONFIG.display.dimensions.barHeight / 2 - 10}px;
          z-index:3;
          user-select:none;
        `;
        STATE.dom.contentWrapper.appendChild(el);
        return el;
      }

      STATE.dom.labels.left = createLabel("L", INNER_BASE_TOP);
      STATE.dom.labels.right = createLabel(
        "R",
        INNER_BASE_TOP +
          CONFIG.display.dimensions.barHeight +
          CONFIG.display.dimensions.spacing
      );

      // Scale rows
      function createScale(text, top) {
        const el = document.createElement("div");
        el.textContent = text;
        el.style.cssText = `
          position:absolute;
          left:20px;
          top:${top}px;
          width:calc(100% - 20px);
          text-align:center;
          user-select:none;
          white-space:nowrap;
          z-index:2;
        `;
        STATE.dom.contentWrapper.appendChild(el);
        return el;
      }

      const NB = "\u00A0";
      const scaleText =
        NB +
        NB +
        "-40" +
        NB.repeat(10) +
        "-30" +
        NB.repeat(10) +
        "-20" +
        NB.repeat(10) +
        "-10" +
        NB.repeat(5) +
        "-5" +
        NB.repeat(2) +
        "-3" +
        NB.repeat(2) +
        "-1" +
        NB.repeat(1) +
        "|" +
        NB.repeat(1) +
        "+1" +
        NB.repeat(2) +
        "+3";

      STATE.dom.scales.left = createScale(scaleText, INNER_BASE_TOP - 20);
      STATE.dom.scales.right = createScale(
        scaleText,
        INNER_BASE_TOP +
          CONFIG.display.dimensions.barHeight * 2 +
          CONFIG.display.dimensions.spacing -
          2
      );

      // Insert tile after freq panel
      const freq = document.querySelector("#freq-container");
      const next = freq?.nextElementSibling;

      if (next?.parentNode) {
        next.parentNode.insertBefore(STATE.dom.container, next.nextSibling);
      } else if (freq?.parentNode) {
        freq.parentNode.appendChild(STATE.dom.container);
      } else {
        document.body.appendChild(STATE.dom.container);
      }

      // Skin inheritance (sync fonts/colors)
      function inheritTextStyles() {
        try {
          const freqContainer = document.querySelector("#freq-container");
          const freqTitle =
            freqContainer?.querySelector("h2") ||
            document.querySelector("#freq-container h2");

          if (freqTitle && STATE.dom.title) {
            const cs = getComputedStyle(freqTitle);
            const t = STATE.dom.title.style;
            t.fontFamily = cs.fontFamily;
            t.fontWeight = cs.fontWeight;
            t.fontSize = cs.fontSize;
            t.letterSpacing = cs.letterSpacing;
            t.textTransform = cs.textTransform;
            t.color = cs.color;
            t.lineHeight = cs.lineHeight;
          }

          const ref =
            freqContainer?.querySelector(".text-small") ||
            document.querySelector("#freq-container .text-small") ||
            document.querySelector(".text-small");

          if (!ref) return;

          const cs = getComputedStyle(ref);
          const targets = [
            STATE.dom.labels.left,
            STATE.dom.labels.right,
            STATE.dom.scales.left,
            STATE.dom.scales.right
          ].filter(Boolean);

          targets.forEach((el) => {
            const base = parseFloat(cs.fontSize);
            el.style.fontFamily = cs.fontFamily;
            el.style.fontWeight = cs.fontWeight;
            el.style.letterSpacing = cs.letterSpacing;
            el.style.textTransform = cs.textTransform;
            el.style.lineHeight = cs.lineHeight;
            el.style.color = cs.color;

            if (
              el === STATE.dom.labels.left ||
              el === STATE.dom.labels.right
            ) {
              el.style.fontSize = base + 2 + "px";
            } else {
              el.style.fontSize = cs.fontSize;
            }
          });

          STATE.dom.scales.left.style.opacity = 0.7;
          STATE.dom.scales.right.style.opacity = 0.7;
        } catch (e) {
          console.error(
            "[StereoIndicators] inheritTextStyles failed:",
            e
          );
        }
      }

      function alignTitle() {
        try {
          const freqTitle = document.querySelector("#freq-container h2");
          const freqPanel = document.querySelector("#freq-container");
          if (!freqTitle || !freqPanel || !STATE.dom.title) return;

          const r1 = freqTitle.getBoundingClientRect();
          const r2 = freqPanel.getBoundingClientRect();

          STATE.dom.title.style.margin = "0 0 0 12px";
          STATE.dom.title.style.position = "relative";
          STATE.dom.title.style.top = r1.top - r2.top + "px";
        } catch (e) {
          console.error("[StereoIndicators] alignTitle failed:", e);
        }
      }

      const applySkin = () => {
        inheritTextStyles();
        alignTitle();
      };

      // Apply skin after DOM builds
      setTimeout(applySkin, 50);
      setTimeout(applySkin, 300);
      try {
        new MutationObserver(() => {
          try {
            applySkin();
          } catch (e) {
            console.error(
              "[StereoIndicators] skin MutationObserver callback failed:",
              e
            );
          }
        }).observe(document.body, {
          attributes: true,
          subtree: true,
          attributeFilter: ["class", "style"]
        });
      } catch (e) {
        console.error(
          "[StereoIndicators] skin MutationObserver init failed:",
          e
        );
      }

      // ============================================================
      // AUDIO ENGINE
      // ============================================================

      function resetAudioState() {
        STATE.audio = {
          context: null,
          splitter: null,
          analyserLeft: null,
          analyserRight: null,
          bassFilter: null,
          highPassFilter: null,
          lowPassFilter: null,
          source: null,
          dataLeft: null,
          dataRight: null
        };
      }

      function linearToDb(x) {
        if (x <= 0) return -120;
        return 20 * Math.log10(x);
      }

      function processChannel(data, prevSmoothDb) {
        const raw = data.reduce((a, b) => a + b, 0) / data.length;
        const linear = raw / 255;

        if (linear < CONFIG.audio.minThreshold) {
          return { instantDb: -120, smoothDb: -120 };
        }

        const shaped = Math.min(
          Math.pow(linear * CONFIG.audio.amplification, CONFIG.audio.riseRate),
          1
        );

        let instantDb = linearToDb(shaped) + CONFIG.audio.dbGain;

        let smoothDb;
        if (instantDb > prevSmoothDb) {
          smoothDb =
            prevSmoothDb +
            (instantDb - prevSmoothDb) * CONFIG.audio.attackSpeed;
        } else {
          smoothDb =
            prevSmoothDb +
            (instantDb - prevSmoothDb) * CONFIG.audio.releaseSpeed;
        }

        return { instantDb, smoothDb };
      }

      function updatePeak(instDb, peakDb, side) {
        if (instDb > peakDb) {
          clearTimeout(STATE.peakTimeout);
          STATE.peakTimeout = setTimeout(() => {
            STATE.levels.left.peakDb = CONFIG.audio.minDb;
            STATE.levels.right.peakDb = CONFIG.audio.minDb;
          }, CONFIG.audio.peakHoldMs);
          return instDb;
        }
        return peakDb - CONFIG.audio.peakDecayDbPerFrame;
      }

      function initAudioSystem() {
        try {
          if (
            typeof Stream !== "undefined" &&
            Stream?.Fallback?.Player &&
            Stream?.Fallback?.Audio
          ) {
            if (!STATE.audio.context) {
              STATE.audio.context = Stream.Fallback.Audio;
              STATE.audio.source = Stream.Fallback.Player.Amplification;
            }

            const ctx = STATE.audio.context;
            if (!ctx || !STATE.audio.source) {
              throw new Error("Audio context or source missing");
            }

            STATE.audio.splitter = ctx.createChannelSplitter(2);
            STATE.audio.analyserLeft = ctx.createAnalyser();
            STATE.audio.analyserRight = ctx.createAnalyser();

            STATE.audio.analyserLeft.fftSize = 256;
            STATE.audio.analyserRight.fftSize = 256;

            STATE.audio.dataLeft = new Uint8Array(
              STATE.audio.analyserLeft.frequencyBinCount
            );
            STATE.audio.dataRight = new Uint8Array(
              STATE.audio.analyserRight.frequencyBinCount
            );

            STATE.audio.bassFilter = ctx.createBiquadFilter();
            STATE.audio.bassFilter.type = "lowshelf";
            STATE.audio.bassFilter.frequency.value = 200;
            STATE.audio.bassFilter.gain.value = CONFIG.audio.bassReduction;

            STATE.audio.highPassFilter = ctx.createBiquadFilter();
            STATE.audio.highPassFilter.type = "highpass";
            STATE.audio.highPassFilter.frequency.value =
              CONFIG.audio.highPassCutoff;

            STATE.audio.lowPassFilter = ctx.createBiquadFilter();
            STATE.audio.lowPassFilter.type = "lowpass";
            STATE.audio.lowPassFilter.frequency.value =
              CONFIG.audio.lowPassCutoff;

            // CONNECT PIPELINE
            STATE.audio.source
              .connect(STATE.audio.bassFilter)
              .connect(STATE.audio.highPassFilter)
              .connect(STATE.audio.lowPassFilter)
              .connect(STATE.audio.splitter);

            STATE.audio.splitter.connect(STATE.audio.analyserLeft, 0);
            STATE.audio.splitter.connect(STATE.audio.analyserRight, 1);

            startRendering();
          } else {
            setTimeout(initAudioSystem, 500);
          }
        } catch (e) {
          console.error("[StereoIndicators] initAudioSystem failed:", e);
          setTimeout(initAudioSystem, 1000);
        }
      }

      // ============================================================
      // RENDER LOOP HOOK
      // ============================================================

      function startRendering() {
        if (!STATE.dom.canvas) return;

        STATE.dom.canvas.width = STATE.dom.canvas.offsetWidth;
        STATE.dom.canvas.height = STATE.dom.canvas.offsetHeight;
        STATE.dom.ctx = STATE.dom.canvas.getContext("2d");

        requestAnimationFrame(updateMetersFrame);
      }

      function updateMetersFrame() {
        try {
          if (!STATE.audio.analyserLeft || !STATE.audio.analyserRight) {
            requestAnimationFrame(updateMetersFrame);
            return;
          }

          STATE.audio.analyserLeft.getByteFrequencyData(
            STATE.audio.dataLeft
          );
          STATE.audio.analyserRight.getByteFrequencyData(
            STATE.audio.dataRight
          );

          const L = processChannel(
            STATE.audio.dataLeft,
            STATE.levels.left.smoothDb
          );
          const R = processChannel(
            STATE.audio.dataRight,
            STATE.levels.right.smoothDb
          );

          STATE.levels.left.smoothDb = L.smoothDb;
          STATE.levels.right.smoothDb = R.smoothDb;

          STATE.levels.left.peakDb = updatePeak(
            L.instantDb,
            STATE.levels.left.peakDb
          );
          STATE.levels.right.peakDb = updatePeak(
            R.instantDb,
            STATE.levels.right.peakDb
          );

          renderMeters();
        } catch (e) {
          console.error("[StereoIndicators] updateMetersFrame failed:", e);
        }

        requestAnimationFrame(updateMetersFrame);
      }

      // ============================================================
      // AUTO REBIND WHEN FM-DX RECREATES AUDIO NODES
      // ============================================================

      let last = null;
      setInterval(() => {
        try {
          if (
            typeof Stream !== "undefined" &&
            Stream?.Fallback?.Player?.Amplification &&
            Stream?.Fallback?.Audio
          ) {
            const node = Stream.Fallback.Player.Amplification;
            if (node !== last) {
              last = node;
              resetAudioState();
        
      // ============================================================
      // PORTRAIT: HIDE L / R & NUMBER ROWS (INLINE-STYLE TARGETING)
      // ============================================================
      function hideStereoLabelsInPortrait() {
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;

        const wrappers = document.querySelectorAll(
          'div[style*="position: relative"][style*="height: 100px"]'
        );

        wrappers.forEach(wrapper => {
          wrapper.style.display = isPortrait ? "none" : "";
        });
      }

      hideStereoLabelsInPortrait();
      window.addEventListener("orientationchange", hideStereoLabelsInPortrait);
      window.addEventListener("resize", hideStereoLabelsInPortrait);

      initAudioSystem();
            }
          }
        } catch (e) {
          console.error(
            "[StereoIndicators] auto-rebind interval failed:",
            e
          );
        }
      }, 1000);

      // Start system

      // ============================================================
      // PORTRAIT: HIDE L / R & NUMBER ROWS (INLINE-STYLE TARGETING)
      // ============================================================
      function hideStereoLabelsInPortrait() {
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;

        const wrappers = document.querySelectorAll(
          'div[style*="position: relative"][style*="height: 100px"]'
        );

        wrappers.forEach(wrapper => {
          wrapper.style.display = isPortrait ? "none" : "";
        });
      }

      hideStereoLabelsInPortrait();
      window.addEventListener("orientationchange", hideStereoLabelsInPortrait);
      window.addEventListener("resize", hideStereoLabelsInPortrait);

      initAudioSystem();
    } catch (e) {
      console.error("[StereoIndicators] DOMContentLoaded init failed:", e);
    }
  });
})(); // END OF MODULE

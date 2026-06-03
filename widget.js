/**
 * TERNKONNECT Accessibility Widget
 * Embeddable accessibility solution for any website
 * @version 1.0.0
 * @license MIT
 */

(function () {
  "use strict";

  const STORAGE_KEY = "tkw_a11y_prefs";
  const ICON_URL =
    "https://res.cloudinary.com/pro-solve/image/upload/v1776851860/Accessibility_ush92x.png";
  const PRIMARY_COLOR = "#6366f1";

  const scriptTag =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"]');
  const config = {
    account: scriptTag?.getAttribute("data-account") || "",
    position: scriptTag?.getAttribute("data-position") || "bottom-right",
    color: scriptTag?.getAttribute("data-color") || PRIMARY_COLOR,
  };

  const DEFAULTS = {
    tts: true,
    contrast: false,
    highlightLinks: false,
    biggerText: false,
    textSpacing: false,
    pauseAnimations: false,
    hideImages: false,
    dyslexiaFriendly: false,
    largeCursor: false,
    tooltips: false,
    lineHeight: false,
    textAlign: false,
    saturation: false,
  };

  let state = { ...DEFAULTS };
  let panelOpen = false;
  let ttsUnlocked = false;
  let hasSpokenOnLoad = false;

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) state = { ...DEFAULTS, ...JSON.parse(saved) };
    } catch (e) { }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { }
  }

  function applyState() {
    const root = document.documentElement;
    const body = document.body;

    if (state.saturation) root.style.filter = "saturate(0)";
    else if (state.contrast) root.style.filter = "contrast(1.5)";
    else root.style.filter = "";

    let linkStyle = document.getElementById("tkw-links-style");
    if (!linkStyle) {
      linkStyle = document.createElement("style");
      linkStyle.id = "tkw-links-style";
      document.head.appendChild(linkStyle);
    }
    linkStyle.textContent = state.highlightLinks
      ? `a { outline: 2px solid ${config.color} !important; background: #eef2ff !important; border-radius: 2px; }`
      : "";

    root.style.fontSize = state.biggerText ? "20px" : "";
    root.style.letterSpacing = state.textSpacing ? "0.12em" : "";
    root.style.wordSpacing = state.textSpacing ? "0.16em" : "";

    let animStyle = document.getElementById("tkw-anim-style");
    if (!animStyle) {
      animStyle = document.createElement("style");
      animStyle.id = "tkw-anim-style";
      document.head.appendChild(animStyle);
    }
    animStyle.textContent = state.pauseAnimations
      ? "*, *::before, *::after { animation-play-state: paused !important; transition: none !important; }"
      : "";

    let imgStyle = document.getElementById("tkw-img-style");
    if (!imgStyle) {
      imgStyle = document.createElement("style");
      imgStyle.id = "tkw-img-style";
      document.head.appendChild(imgStyle);
    }
    imgStyle.textContent = state.hideImages
      ? "img:not(#tkw-btn-icon), video, iframe { visibility: hidden !important; }"
      : "";

    let fontStyle = document.getElementById("tkw-font-style");
    if (!fontStyle) {
      fontStyle = document.createElement("style");
      fontStyle.id = "tkw-font-style";
      document.head.appendChild(fontStyle);
    }
    fontStyle.textContent = state.dyslexiaFriendly
      ? "* { font-family: Arial, sans-serif !important; letter-spacing: 0.05em !important; word-spacing: 0.1em !important; }"
      : "";

    body.style.cursor = state.largeCursor
      ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M8 2l16 12-7 1 4 9-3 1-4-9-6 5z' fill='black' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E\") 0 0, auto"
      : "";

    root.style.lineHeight = state.lineHeight ? "2" : "";

    let alignStyle = document.getElementById("tkw-align-style");
    if (!alignStyle) {
      alignStyle = document.createElement("style");
      alignStyle.id = "tkw-align-style";
      document.head.appendChild(alignStyle);
    }
    alignStyle.textContent = state.textAlign
      ? "p, li, span, div { text-align: left !important; }"
      : "";
  }

  function unlockTTS() {
    if (ttsUnlocked) return;
    ttsUnlocked = true;
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  }

  function speak(text) {
    if (!state.tts || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  function readPageSummary() {
    if (hasSpokenOnLoad || !state.tts) return;
    hasSpokenOnLoad = true;
    const title = document.title || "";
    const h1 = document.querySelector("h1")?.innerText || "";
    const firstP = document.querySelector("p")?.innerText || "";
    const main = document.querySelector("main")?.innerText.slice(0, 300) || "";
    const article =
      document.querySelector("article")?.innerText.slice(0, 300) || "";
    const summary = [title, h1, firstP, main || article]
      .filter(Boolean)
      .join(". ")
      .slice(0, 500);
    if (summary) speak(summary);
  }

  function toggle(key) {
    state[key] = !state[key];
    saveState();
    if (key === "tts") {
      if (!state.tts) {
        window.speechSynthesis.cancel();
      } else {
        hasSpokenOnLoad = false;
        setTimeout(readPageSummary, 300);
      }
    } else {
      applyState();
    }
    renderPanel();
  }

  function reset() {
    state = { ...DEFAULTS };
    saveState();
    applyState();
    renderPanel();
  }

  function renderButton() {
    const btn = document.createElement("button");
    btn.id = "tkw-btn";
    btn.setAttribute("aria-label", "Accessibility settings");
    btn.style.cssText = `
      position: fixed;
      ${config.position.includes("bottom") ? "bottom: 24px;" : "top: 24px;"}
      ${config.position.includes("left") ? "left: 24px;" : "right: 24px;"}
      z-index: 999999;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    `;
    btn.onmouseenter = () => (btn.style.transform = "scale(1.1)");
    btn.onmouseleave = () => (btn.style.transform = "scale(1)");
    btn.onclick = () => {
      panelOpen = !panelOpen;
      renderPanel();
    };

    const img = document.createElement("img");
    img.id = "tkw-btn-icon";
    img.src = ICON_URL;
    img.alt = "Accessibility";
    img.style.cssText = "width: 40px; height: 40px; pointer-events: none;";
    btn.appendChild(img);
    document.body.appendChild(btn);

    // Audio prompt banner
    const banner = document.createElement("div");
    banner.id = "tkw-audio-banner";
    banner.style.cssText = `
      position: fixed;
      bottom: 90px;
      ${config.position.includes("left") ? "left: 16px;" : "right: 16px;"}
      z-index: 999998;
      background: #6366f1;
      color: white;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-family: system-ui, sans-serif;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(99,102,241,0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: tkw-pulse 2s infinite;
    `;
    banner.innerHTML = "🔊 Click anywhere to enable audio";
    document.body.appendChild(banner);

    const pulseStyle = document.createElement("style");
    pulseStyle.textContent = `
      @keyframes tkw-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.02); }
      }
    `;
    document.head.appendChild(pulseStyle);
  }

  function renderPanel() {
    let panel = document.getElementById("tkw-panel-overlay");
    if (!panelOpen) {
      if (panel) panel.remove();
      return;
    }

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "tkw-panel-overlay";
      panel.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 1000000;
        display: flex;
        align-items: flex-end;
        justify-content: ${config.position.includes("left") ? "flex-start" : "flex-end"};
        padding: ${config.position.includes("bottom") ? "0 16px 90px 16px" : "90px 16px 0 16px"};
        pointer-events: none;
      `;
      panel.onclick = (e) => {
        if (e.target === panel) {
          panelOpen = false;
          renderPanel();
        }
      };

      const backdrop = document.createElement("div");
      backdrop.style.cssText =
        "position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: -1; pointer-events: all;";
      backdrop.onclick = () => {
        panelOpen = false;
        renderPanel();
      };
      panel.appendChild(backdrop);

      const container = document.createElement("div");
      container.id = "tkw-panel";
      container.style.cssText = `
        position: relative;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        width: 288px;
        max-width: calc(100vw - 32px);
        max-height: 80vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        pointer-events: all;
      `;
      panel.appendChild(container);
      document.body.appendChild(panel);
    }

    const container = document.getElementById("tkw-panel");
    if (!container) return;

    const cards = [
      { key: "tts", label: "Screen Reader", icon: state.tts ? "🔊" : "🔇" },
      { key: "contrast", label: "Contrast +", icon: "◐" },
      { key: "highlightLinks", label: "Highlight Links", icon: "🔗" },
      { key: "biggerText", label: "Bigger Text", icon: "TT" },
      { key: "textSpacing", label: "Text Spacing", icon: "↔" },
      { key: "pauseAnimations", label: "Pause Animations", icon: "⏸" },
      { key: "hideImages", label: "Hide Images", icon: "🖼" },
      { key: "dyslexiaFriendly", label: "Dyslexia Friendly", icon: "Df" },
      { key: "largeCursor", label: "Cursor", icon: "➤" },
      { key: "tooltips", label: "Tooltips", icon: "💬" },
      { key: "lineHeight", label: "Line Height", icon: "≡" },
      { key: "textAlign", label: "Text Align", icon: "≣" },
      { key: "saturation", label: "Saturation", icon: "💧" },
    ];

    container.innerHTML = `
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; background: white; z-index: 10;">
    <span style="font-weight: 700; font-size: 14px; color: #1a1d2e;">Accessibility</span>
    <div style="display: flex; align-items: center; gap: 8px;">
      <button id="tkw-reset" style="font-size: 11px; color: #6b7280; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px;">↻ Reset</button>
      <button id="tkw-close" style="background: none; border: none; cursor: pointer; font-size: 18px; color: #6b7280;">×</button>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px;">
    ${cards
        .map(({ key, label, icon }) => {
          const active = state[key];
          return `
        <button data-key="${key}" class="tkw-card" style="
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; padding: 16px; border-radius: 12px;
          border: 1px solid ${active ? config.color : "#e5e7eb"};
          background: ${active ? config.color + "1a" : "#fff"};
          color: ${active ? config.color : "#1a1d2e"};
          cursor: pointer; transition: all 0.2s; text-align: center;
        ">
          <span style="font-size: 24px;">${icon}</span>
          <span style="font-size: 11px; font-weight: 500; line-height: 1.2;">${label}</span>
        </button>
      `;
        })
        .join("")}
  </div>

  <div style="
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 1px solid #e5e7eb;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  ">
    <a href="https://ternkonnect.com" target="_blank" rel="noopener" style="
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
    ">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#tkw-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <defs>
          <linearGradient id="tkw-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1"/>
            <stop offset="100%" style="stop-color:#8b5cf6"/>
          </linearGradient>
        </defs>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>

      <div>
        <div style="font-size: 11px; font-weight: 700; color: #6366f1; line-height: 1.2;">TERNKONNECT</div>
        <div style="font-size: 9px; color: #9ca3af; line-height: 1.2;">Accessibility Widget</div>
      </div>
    </a>
 
<a href="https://ternkonnect.com" target="_blank" rel="noopener" style="text-decoration: none;">
  <div>
    <div style="font-size: 11px; font-weight: 700; color: #6366f1; line-height: 1.2;">Powered By</div>
    <div style="font-size: 9px; color: #9ca3af; line-height: 1.2;">TERNKONNECT</div>
  </div>
</a> 
  </div>
`;

    document.getElementById("tkw-close").onclick = () => {
      panelOpen = false;
      renderPanel();
    };
    document.getElementById("tkw-reset").onclick = reset;
    document.querySelectorAll(".tkw-card").forEach((btn) => {
      btn.onclick = () => toggle(btn.getAttribute("data-key"));
    });
  }

  function init() {
    if (document.getElementById("tkw-btn")) return;

    loadState();
    applyState();
    renderButton();

    const unlockHandler = () => {
      unlockTTS();
      document.removeEventListener("click", unlockHandler);
      document.removeEventListener("touchstart", unlockHandler);
    };
    document.addEventListener("click", unlockHandler, { once: true });
    document.addEventListener("touchstart", unlockHandler, {
      once: true,
      passive: true,
    });

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    const readHandler = () => {
      const banner = document.getElementById("tkw-audio-banner");
      if (banner) banner.remove();
      unlockTTS();
      setTimeout(readPageSummary, 500);
    };

    if (isMobile) {
      document.addEventListener("click", readHandler, { once: true });
      document.addEventListener("touchstart", readHandler, {
        once: true,
        passive: true,
      });
    } else {
      try {
        const testUtterance = new SpeechSynthesisUtterance("");
        testUtterance.volume = 0;
        testUtterance.onend = () => setTimeout(readPageSummary, 300);
        testUtterance.onerror = () => {
          document.addEventListener("click", readHandler, { once: true });
          document.addEventListener("keydown", readHandler, { once: true });
        };
        window.speechSynthesis.speak(testUtterance);
      } catch (e) {
        document.addEventListener("click", readHandler, { once: true });
        document.addEventListener("keydown", readHandler, { once: true });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

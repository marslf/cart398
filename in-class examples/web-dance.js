(function () {

  // ─── HELPERS ─────────────────────────────────────────
  const intervals = {}, styleEls = {};

  function injectStyle(id, css) {
    styleEls[id]?.remove();
    const el = document.createElement("style");
    el.setAttribute("data-live-id", id);
    el.textContent = css;
    document.head.appendChild(el);
    styleEls[id] = el;
  }
  function removeStyle(id)   { styleEls[id]?.remove(); delete styleEls[id]; }
  function stopInterval(id)  { clearInterval(intervals[id]); delete intervals[id]; }

  // ─── EFFECT 1 — Image Rotation ───────────────────────
  let imgSyncMode = true;
  let imgSyncAngle = 0;

  function applyImgRotation() {
    document.querySelectorAll("img").forEach(img => {
      clearInterval(img._rotInterval);
      img.style.transition = "transform 0.2s linear";
      if (imgSyncMode) {
        img._rotInterval = null;
      } else {
        const speed = Math.floor(Math.random() * 150 + 500);
        const step  = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 20) + 5);
        let angle = parseFloat(img.dataset.angle || 0);
        img._rotInterval = setInterval(() => {
          angle += step;
          img.dataset.angle = angle;
          img.style.transform = `rotateY(${angle}deg)`;
        }, speed);
      }
    });
  }

  function startImgRotation() {
    imgSyncAngle = 0;
    imgSyncMode = true;
    applyImgRotation();
    intervals.imgRotation = setInterval(() => {
      if (!imgSyncMode) return;
      imgSyncAngle += 15;
      document.querySelectorAll("img").forEach(img => {
        img.dataset.angle = imgSyncAngle;
        img.style.transform = `rotateY(${imgSyncAngle}deg)`;
      });
    }, 100);
  }

  function stopImgRotation() {
    stopInterval("imgRotation");
    document.querySelectorAll("img").forEach(img => {
      clearInterval(img._rotInterval);
      delete img._rotInterval;
      delete img.dataset.angle;
      img.style.transform = img.style.transition = "";
    });
    imgSyncMode = true;
  }

  function toggleImgSync() {
    if (!effects.imgRotation.active) return;
    imgSyncMode = !imgSyncMode;
    applyImgRotation();
    printState();
  }

  // ─── EFFECT 2 — Text Choreography ────────────────────
  function startTextAnim() {
    const elements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, a, li, blockquote"
    );
    const patterns = {
      float:   n=>`@keyframes ${n}{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`,
      shake:   n=>`@keyframes ${n}{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}`,
      wobble:  n=>`@keyframes ${n}{0%,100%{transform:rotateZ(0deg)}50%{transform:rotateZ(2deg)}}`,
      stretch: n=>`@keyframes ${n}{0%,100%{transform:scale(1)}50%{transform:scale(3)}}`,
      tilt:    n=>`@keyframes ${n}{0%,100%{transform:rotateY(0deg)}50%{transform:rotateY(20deg)}}`,
      bounce:  n=>`@keyframes ${n}{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-15px)}}`,
    };
    const keys = Object.keys(patterns);
    let css = "";
    elements.forEach((el, i) => {
      const name    = `tx_${i}`;
      const pattern = keys[Math.floor(Math.random() * keys.length)];
      const dur     = (Math.random() * 2 + 1.5).toFixed(2);
      css += patterns[pattern](name);
      css += `[data-tx="${i}"]{display:inline-block;animation:${name} ${dur}s infinite ease-in-out;}`;
      el.setAttribute("data-tx", i);
    });
    injectStyle("textAnim", css);
  }
  function stopTextAnim() {
    removeStyle("textAnim");
    document.querySelectorAll("[data-tx]").forEach(el => el.removeAttribute("data-tx"));
  }

  // ─── EFFECT 3 — Font Chaos ───────────────────────────
  function startFontChaos() {
    intervals.fontChaos = setInterval(() => {
      [...document.querySelectorAll("*")].forEach(el => {
        el.style.fontSize = Math.floor(Math.random() * 20 + 8) + "px";
      });
    }, 100);
  }
  function stopFontChaos() {
    stopInterval("fontChaos");
    document.querySelectorAll("*").forEach(el => el.style.fontSize = "");
  }

  // ─── EFFECT 4 — Image Wobble ─────────────────────────
  let wobbleSyncMode = true;

  function applyImgWobble() {
    removeStyle("imgWobble");
    if (wobbleSyncMode) {
      injectStyle("imgWobble", `
        @keyframes _wobble {
          0%,100%{ transform:rotate(0deg) translateX(0);    }
          25%    { transform:rotate(20deg) translateX(2px);  }
          50%    { transform:rotate(-20deg) translateX(-2px);}
          75%    { transform:rotate(10deg) translateX(1px);  }
        }
        img { animation: _wobble 0.3s infinite ease-in-out; display:inline-block; }`);
    } else {
      let css = "";
      document.querySelectorAll("img").forEach((img, i) => {
        const name  = `_wobble_${i}`;
        const dur   = (Math.random() * 0.4 + 0.15).toFixed(3);   // 0.15–0.55s
        const deg   = Math.floor(Math.random() * 25 + 10);        // 10–35°
        const tx    = (Math.random() * 3 + 1).toFixed(1);         // 1–4px
        const delay = (Math.random() * 0.4).toFixed(3);           // 0–0.4s phase offset
        css += `
          @keyframes ${name} {
            0%,100%{ transform:rotate(0deg) translateX(0);        }
            25%    { transform:rotate(${deg}deg) translateX(${tx}px);   }
            50%    { transform:rotate(-${deg}deg) translateX(-${tx}px); }
            75%    { transform:rotate(${Math.floor(deg/2)}deg) translateX(${(tx/2).toFixed(1)}px); }
          }`;
        img.setAttribute("data-wobble", i);
        css += `[data-wobble="${i}"]{ animation:${name} ${dur}s ${delay}s infinite ease-in-out; display:inline-block; }`;
      });
      injectStyle("imgWobble", css);
    }
  }

  function startImgWobble() {
    wobbleSyncMode = true;
    applyImgWobble();
  }
  function stopImgWobble() {
    removeStyle("imgWobble");
    document.querySelectorAll("img").forEach(img => {
      img.style.animation = "";
      img.removeAttribute("data-wobble");
    });
    wobbleSyncMode = true;
  }
  function toggleWobbleSync() {
    if (!effects.imgWobble.active) return;
    wobbleSyncMode = !wobbleSyncMode;
    applyImgWobble();
    printState();
  }

  // ─── EFFECTS REGISTRY ────────────────────────────────
  const effects = {
    imgRotation: { start:startImgRotation, stop:stopImgRotation, active:false, label:"img rotate" },
    textAnim:    { start:startTextAnim,    stop:stopTextAnim,    active:false, label:"text dance" },
    fontChaos:   { start:startFontChaos,   stop:stopFontChaos,   active:false, label:"font chaos" },
    imgWobble:   { start:startImgWobble,   stop:stopImgWobble,   active:false, label:"img wobble" },
  };

  const keyMap = { "1":"imgRotation", "2":"textAnim", "3":"fontChaos", "4":"imgWobble" };

  // ─── TOGGLE & HUD ─────────────────────────────────────
  function toggle(name) {
    const fx = effects[name];
    fx.active = !fx.active;
    fx.active ? fx.start() : fx.stop();
    printState();
  }
  function killAll() {
    Object.values(effects).forEach(fx => { if (fx.active) { fx.stop(); fx.active = false; } });
    imgSyncMode = true;
    wobbleSyncMode = true;
    printState();
  }
  function printState() {
    const lines = Object.entries(keyMap).map(([k, name]) => {
      const fx = effects[name];
      return `  ${k}  [${fx.active ? "▶ ON " : "■ OFF"}]  ${fx.label}`;
    });
    const rotSyncLine    = `  9  [${imgSyncMode    ? "SYNC  " : "RANDOM"}]  img rotation mode`;
    const wobbleSyncLine = `  8  [${wobbleSyncMode ? "SYNC  " : "RANDOM"}]  img wobble mode`;
    console.log(`\n🎹 Choreography\n${lines.join("\n")}\n${rotSyncLine}\n${wobbleSyncLine}\n  0  [RESET]   kill all\n`);
  }

  // ─── KEYBOARD LISTENER ───────────────────────────────
  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (keyMap[e.key]) toggle(keyMap[e.key]);
    if (e.key === "9") toggleImgSync();
    if (e.key === "8") toggleWobbleSync();
    if (e.key === "0") killAll();
  });

  printState();

})();
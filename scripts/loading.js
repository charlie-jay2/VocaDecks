document.addEventListener("DOMContentLoaded", () => {
  // Clear diagnostic status on page reload to reset state
  localStorage.removeItem("fullscreenDiagnosticDone");

  // --- CONFIGURATION ---
  const splashImagePath = "./Assets/STARTING_SCREEN.jpg";
  const buttonImagePath = "./Assets/FULLSCREEN_BUTtON.png";
  const fontURL = "./Fonts/Panton.otf";
  const videoPath = "./Assets/video.mp4";

  // --- LOAD FONT ---
  const fontFace = new FontFace("Panton", `url(${fontURL})`);
  fontFace.load().then(function (loadedFace) {
    document.fonts.add(loadedFace);
  });

  // --- CREATE SPLASH IMAGE ---
  const ss = document.createElement("img");
  ss.className = "ss";
  ss.src = splashImagePath;
  ss.style.position = "fixed";
  ss.style.top = "50%";
  ss.style.left = "50%";
  ss.style.transform = "translate(-50%, -50%)";
  ss.style.width = "auto";
  ss.style.height = "100%";
  ss.style.zIndex = "999";
  ss.style.display = "none";
  document.body.appendChild(ss);

  // --- CREATE VIDEO ELEMENT ---
  const videoElement = document.createElement("video");
  videoElement.src = videoPath;
  videoElement.style.position = "fixed";
  videoElement.style.top = "0";
  videoElement.style.left = "0";
  videoElement.style.width = "100vw";
  videoElement.style.height = "100vh";
  videoElement.style.objectFit = "cover";
  videoElement.style.zIndex = "1003";
  videoElement.style.display = "none";
  videoElement.style.pointerEvents = "none";
  videoElement.style.opacity = "1";
  videoElement.style.transition = "opacity 1s ease";
  videoElement.setAttribute("playsinline", "");
  videoElement.setAttribute("webkit-playsinline", "");
  document.body.appendChild(videoElement);

  // --- CREATE FULLSCREEN BUTTON ---
  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.id = "fullscreenBtn";
  fullscreenBtn.style.position = "fixed";
  fullscreenBtn.style.top = "50%";
  fullscreenBtn.style.left = "50%";
  fullscreenBtn.style.transform = "translate(-50%, -50%)";
  fullscreenBtn.style.backgroundColor = "transparent";
  fullscreenBtn.style.border = "none";
  fullscreenBtn.style.cursor = "pointer";
  fullscreenBtn.style.zIndex = "10000";
  fullscreenBtn.style.padding = "0";
  fullscreenBtn.style.width = "auto";
  fullscreenBtn.style.height = "auto";
  fullscreenBtn.style.display = "none";

  const btnImg = document.createElement("img");
  btnImg.src = buttonImagePath;
  btnImg.style.width = "400px";
  btnImg.style.maxWidth = "90vw";
  btnImg.style.maxHeight = "90vh";
  btnImg.style.height = "auto";
  btnImg.style.transition =
    "transform 0.3s ease-in-out, filter 0.3s ease-in-out";

  fullscreenBtn.appendChild(btnImg);
  document.body.appendChild(fullscreenBtn);

  fullscreenBtn.addEventListener("mouseenter", () => {
    btnImg.style.transform = "scale(1.05)";
    btnImg.style.filter = "invert(1)";
  });

  fullscreenBtn.addEventListener("mouseleave", () => {
    btnImg.style.transform = "scale(1)";
    btnImg.style.filter = "none";
  });

  // --- CREATE DIAGNOSTICS TEXT CONTAINER ---
  const diagnostics = document.createElement("div");
  diagnostics.id = "diagnosticsText";
  diagnostics.style.position = "fixed";
  diagnostics.style.top = "50%";
  diagnostics.style.left = "50%";
  diagnostics.style.transform = "translate(-50%, -50%)";
  diagnostics.style.color = "white";
  diagnostics.style.fontSize = "18px";
  diagnostics.style.fontFamily = "Panton, monospace";
  diagnostics.style.zIndex = "1001";
  diagnostics.style.whiteSpace = "pre-line";
  diagnostics.style.textAlign = "center";
  diagnostics.style.display = "none";
  document.body.appendChild(diagnostics);

  // --- CREATE PROGRESS BAR CONTAINER ---
  const progressBarContainer = document.createElement("div");
  progressBarContainer.style.position = "fixed";
  progressBarContainer.style.bottom = "0";
  progressBarContainer.style.left = "0";
  progressBarContainer.style.width = "100%";
  progressBarContainer.style.height = "6px";
  progressBarContainer.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
  progressBarContainer.style.zIndex = "1002";
  progressBarContainer.style.display = "none";
  document.body.appendChild(progressBarContainer);

  // --- CREATE PROGRESS BAR ---
  const progressBar = document.createElement("div");
  progressBar.style.height = "100%";
  progressBar.style.width = "0%";
  progressBar.style.background = "linear-gradient(to right, #55d9cb, #feef3c)";
  progressBar.style.transition = "width 0.8s ease-in-out";
  progressBarContainer.appendChild(progressBar);

  // --- CREATE BLUR OVERLAY ---
  const blurOverlay = document.createElement("div");
  blurOverlay.style.position = "fixed";
  blurOverlay.style.top = "0";
  blurOverlay.style.left = "0";
  blurOverlay.style.width = "100vw";
  blurOverlay.style.height = "100vh";
  blurOverlay.style.background = "linear-gradient(to right, #55d9cb, #feef3c)";
  blurOverlay.style.opacity = "0.85";
  blurOverlay.style.backdropFilter = "blur(8px)";
  blurOverlay.style.zIndex = "9998";
  blurOverlay.style.display = "none";
  blurOverlay.style.pointerEvents = "none";
  document.body.appendChild(blurOverlay);

  // --- VARIABLES ---
  const messages = [
    "Finishing Snacks...",
    "Performing Sound Check...",
    "Verifying Twintail modules...",
    "Syncing Triple Baka sub-systems...",
    "Establishing secure Decks...",
    "Finalizing Vocaloid token...",
    "Diagnostics complete. Preparing interface...",
  ];

  const diagnosticKey = "fullscreenDiagnosticDone";
  let diagnosticDone = localStorage.getItem(diagnosticKey) === "true";

  function typeMessage(text, delay = 50) {
    return new Promise((resolve) => {
      let i = 0;
      diagnostics.textContent = "";
      const interval = setInterval(() => {
        if (i < text.length) {
          diagnostics.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(interval);
          diagnostics.textContent += "\n";
          resolve();
        }
      }, delay);
    });
  }

  async function playDiagnosticsSequence() {
    diagnostics.style.display = "block";
    progressBarContainer.style.display = "block";
    progressBar.style.width = "0%";

    const totalMessages = messages.length;
    let progress = 0;

    for (let i = 0; i < totalMessages; i++) {
      await typeMessage(messages[i], 50);
      const increment = Math.floor(Math.random() * 15) + 10;
      progress += increment;
      if (progress > 100 || i === totalMessages - 1) progress = 100;
      progressBar.style.width = `${progress}%`;
      await new Promise((r) => setTimeout(r, 1000));
    }

    setTimeout(() => {
      diagnostics.style.display = "none";
      progressBarContainer.style.display = "none";
      progressBar.style.width = "0%";
      videoElement.style.display = "block";
      videoElement.play();
      ss.style.display = "none"; // ✅ HIDE SPLASH IMAGE IMMEDIATELY WHEN VIDEO STARTS

      setTimeout(() => {
        // Fade out video
        videoElement.style.opacity = "0";

        setTimeout(() => {
          videoElement.style.display = "none";
          videoElement.style.opacity = "1";

          diagnosticDone = true;
          localStorage.setItem(diagnosticKey, "true");
        }, 1000);
      }, 5500);
    }, 1000);
  }

  function isFullScreen() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function setInteractable(interactable) {
    if (interactable) {
      blurOverlay.style.display = "none";
      blurOverlay.style.pointerEvents = "none";
      document.body.style.filter = "none";
    } else {
      blurOverlay.style.display = "block";
      blurOverlay.style.pointerEvents = "auto";
      document.body.style.filter = "none";
    }
  }

  function checkFullscreenStatus() {
    if (!isFullScreen()) {
      fullscreenBtn.style.display = "block";
      diagnostics.style.display = "none";
      progressBarContainer.style.display = "none";
      progressBar.style.width = "0%";

      if (diagnosticDone) {
        setInteractable(false);
        ss.style.display = "none";
      } else {
        setInteractable(true);
        ss.style.display = "block";
      }
    } else {
      fullscreenBtn.style.display = "none";
      diagnostics.textContent = "";
      progressBar.style.width = "0%";
      setInteractable(true);

      if (!diagnosticDone) {
        ss.style.display = "block";
        playDiagnosticsSequence();
      } else {
        ss.style.display = "none";
      }
    }
  }

  fullscreenBtn.addEventListener("click", () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullscreen) {
      docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", checkFullscreenStatus);
  document.addEventListener("webkitfullscreenchange", checkFullscreenStatus);
  document.addEventListener("mozfullscreenchange", checkFullscreenStatus);
  document.addEventListener("MSFullscreenChange", checkFullscreenStatus);

  checkFullscreenStatus();
});

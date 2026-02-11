window.onload = () => {
  const intro = document.getElementById("intro");
  const work = document.getElementById("work");

  setTimeout(() => {
    intro.style.opacity = "0";
    setTimeout(() => {
      intro.style.display = "none";
      work.classList.add("loaded");
    }, 1500);
  }, 2000);

  document.querySelectorAll("[data-video]").forEach(project => {

    const iframe = project.querySelector("iframe");
    if (!iframe) return;

    const clickLayer = project.querySelector(".click-layer");
    const watch = project.querySelector(".watch");
    const player = new Vimeo.Player(iframe);

    // Build controls bar
    const controls = document.createElement("div");
    controls.className = "player-controls";
    controls.innerHTML = `
      <button class="btn-play-pause" aria-label="Pause">
        <svg class="icon-pause" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <svg class="icon-play" style="display:none" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20"/></svg>
      </button>
      <div class="progress-track"><div class="progress-fill"></div></div>
      <span class="time-display">0:00</span>
    `;
    project.appendChild(controls);

    const btnPlayPause = controls.querySelector(".btn-play-pause");
    const iconPlay = controls.querySelector(".icon-play");
    const iconPause = controls.querySelector(".icon-pause");
    const progressTrack = controls.querySelector(".progress-track");
    const progressFill = controls.querySelector(".progress-fill");
    const timeDisplay = controls.querySelector(".time-display");
    let isPaused = false;

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + ":" + String(s).padStart(2, "0");
    }

    // Update progress bar
    player.on("timeupdate", (data) => {
      if (!project.classList.contains("is-fullscreen")) return;
      progressFill.style.width = (data.percent * 100) + "%";
      timeDisplay.textContent = formatTime(data.duration - data.seconds);
    });

    // Play/pause toggle
    btnPlayPause.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isPaused) {
        player.play();
        iconPlay.style.display = "none";
        iconPause.style.display = "";
        isPaused = false;
      } else {
        player.pause();
        iconPlay.style.display = "";
        iconPause.style.display = "none";
        isPaused = true;
      }
    });

    // Click progress bar to seek
    progressTrack.addEventListener("click", (e) => {
      e.stopPropagation();
      const pct = e.offsetX / progressTrack.offsetWidth;
      player.getDuration().then((dur) => {
        player.setCurrentTime(pct * dur);
      });
    });

    // Auto-show/hide controls on mouse movement
    let hideTimer = null;
    function showControls() {
      project.classList.add("controls-visible");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        project.classList.remove("controls-visible");
      }, 2500);
    }
    project.addEventListener("mousemove", () => {
      if (project.classList.contains("is-fullscreen")) showControls();
    });

    // Hover preview only for main hero videos (not commercials)
    const isCommercial = project.classList.contains("commercial");
    if (!isCommercial && window.matchMedia("(hover: hover)").matches) {
      project.addEventListener("mouseenter", () => {
        player.play().catch(() => {});
      });
      project.addEventListener("mouseleave", () => {
        if (!project.classList.contains("is-fullscreen")) {
          player.pause().catch(() => {});
        }
      });
    }

    // Click → fullscreen + play (fullscreen MUST be synchronous with user gesture)
    clickLayer.addEventListener("click", () => {
      if (project.classList.contains("is-fullscreen")) {
        const exitFs = document.exitFullscreen || document.webkitExitFullscreen;
        if (exitFs) exitFs.call(document);
        return;
      }

      project.classList.add("is-fullscreen");
      project.classList.add("is-playing");
      watch.style.display = "none";

      const goFullscreen = project.requestFullscreen
        || project.webkitRequestFullscreen
        || project.msRequestFullscreen;
      if (goFullscreen) goFullscreen.call(project);

      player.setMuted(false);
      player.setVolume(1);
      player.play().catch(() => {});
      isPaused = false;
      iconPlay.style.display = "none";
      iconPause.style.display = "";
      showControls();
    });

    const onFullscreenExit = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (!fsEl) {
        project.classList.remove("is-fullscreen");
        project.classList.remove("is-playing");
        watch.style.display = "";
        player.setMuted(true);
        player.pause().catch(() => {});
        progressFill.style.width = "0%";
        project.classList.remove("controls-visible");
        clearTimeout(hideTimer);
        isPaused = false;
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenExit);
    document.addEventListener("webkitfullscreenchange", onFullscreenExit);
  });
};

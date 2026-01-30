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
    const clickLayer = project.querySelector(".click-layer");
    const watch = project.querySelector(".watch");
    const playBtn = project.querySelector(".playpause");
    const timeline = project.querySelector(".timeline");
    const progress = project.querySelector(".progress");

    const player = new Vimeo.Player(iframe);

    let playing = false;
    let interval = null;

    /* Hover preview */
    if (window.matchMedia("(hover: hover)").matches) {
      project.addEventListener("mouseenter", () => {
        player.setVolume(0);
        player.play().catch(() => {});
      });

      project.addEventListener("mouseleave", () => {
        if (!project.classList.contains("is-fullscreen")) {
          player.pause().catch(() => {});
        }
      });
    }

    /* CLICK → FULLSCREEN */
    clickLayer.addEventListener("click", async () => {
      watch.style.display = "none";
      project.classList.add("is-fullscreen");

      await player.setVolume(1);
      await player.play();

      iframe.requestFullscreen();

      playing = true;
      interval = setInterval(updateProgress, 200);
    });

    function updateProgress() {
      Promise.all([player.getCurrentTime(), player.getDuration()])
        .then(([t, d]) => {
          progress.style.width = (t / d) * 100 + "%";
        });
    }

    playBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (playing) {
        player.pause();
        playBtn.textContent = "PLAY";
      } else {
        player.play();
        playBtn.textContent = "PAUSE";
      }
      playing = !playing;
    });

    timeline.addEventListener("click", e => {
      e.stopPropagation();
      const rect = timeline.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      player.getDuration().then(d => player.setCurrentTime(d * percent));
    });

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        project.classList.remove("is-fullscreen");
        watch.style.display = "";
        player.pause();
        clearInterval(interval);
        playing = false;
      }
    });
  });
};

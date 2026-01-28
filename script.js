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

  // ---- Video logic ----
  if (typeof Vimeo === "undefined") return;

  document.querySelectorAll("[data-video]").forEach(project => {
    const iframe = project.querySelector("iframe");
    if (!iframe) return;

    const player = new Vimeo.Player(iframe);
    const watch = project.querySelector(".watch");
    const playBtn = project.querySelector(".playpause");
    const timeline = project.querySelector(".timeline");
    const progress = project.querySelector(".progress");
    const back = project.querySelector(".skip.back");
    const forward = project.querySelector(".skip.forward");

    let playing = false;
    let timer = null;

    // Hover preview
    if (window.matchMedia("(hover: hover)").matches) {
      project.addEventListener("mouseenter", () => {
        player.setVolume(0);
        player.play().catch(() => {});
      });

      project.addEventListener("mouseleave", () => {
        if (!playing) player.pause().catch(() => {});
      });
    }

    // Click to fullscreen
    project.querySelector(".click-layer").addEventListener("click", () => {
      if (watch) watch.style.display = "none";

      playing = true;
      player.setVolume(1);
      player.play().catch(() => {});

      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }

      timer = setInterval(updateProgress, 200);
    });

    function updateProgress() {
      Promise.all([player.getCurrentTime(), player.getDuration()])
        .then(([t, d]) => {
          if (d > 0) {
            progress.style.width = (t / d * 100) + "%";
          }
        })
        .catch(() => {});
    }

    playBtn.onclick = e => {
      e.stopPropagation();
      if (playing) {
        player.pause();
        playBtn.textContent = "PLAY";
      } else {
        player.play();
        playBtn.textContent = "PAUSE";
      }
      playing = !playing;
    };

    back.onclick = e => {
      e.stopPropagation();
      player.getCurrentTime()
        .then(t => player.setCurrentTime(Math.max(0, t - 5)));
    };

    forward.onclick = e => {
      e.stopPropagation();
      Promise.all([player.getCurrentTime(), player.getDuration()])
        .then(([t, d]) => player.setCurrentTime(Math.min(d, t + 5)));
    };

    timeline.onclick = e => {
      const rect = timeline.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      player.getDuration()
        .then(d => player.setCurrentTime(d * percent));
    };

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        playing = false;
        if (watch) watch.style.display = "";
        player.pause().catch(() => {});
        clearInterval(timer);
      }
    });
  });
};

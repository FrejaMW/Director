document.addEventListener("DOMContentLoaded", () => {

  const intro = document.getElementById("intro");
  const work = document.getElementById("work");

  // Intro fade out
  setTimeout(() => {
    intro.style.opacity = "0";
    setTimeout(() => {
      intro.style.display = "none";
      work.classList.add("loaded");
      document.body.style.overflow = "auto";
    }, 1200);
  }, 2000);

  const projects = document.querySelectorAll("[data-video]");

  projects.forEach(project => {
    const iframe = project.querySelector("[data-iframe]");
    const clickLayer = project.querySelector(".click-layer");
    const watchLabel = project.querySelector("[data-watch]");
    const player = new Vimeo.Player(iframe);

    const controls = project.querySelector(".controls");
    const playPauseBtn = project.querySelector(".playpause");
    const progressBar = project.querySelector("[data-progress]");
    const timeline = project.querySelector("[data-timeline]");
    const skipBack = project.querySelector(".skip.back");
    const skipForward = project.querySelector(".skip.forward");

    let playing = false;
    let intervalId;

    // Hover start (muted)
    project.addEventListener("mouseenter", () => {
      player.setVolume(0.2);
      player.play().catch(() => {});
    });

    project.addEventListener("mouseleave", () => {
      if (!playing) player.pause().catch(() => {});
    });

    // Click to open fullscreen
    clickLayer.addEventListener("click", () => {
      if (watchLabel) watchLabel.style.display = "none";

      playing = true;
      playPauseBtn.textContent = "PAUSE";

      player.setVolume(1);
      player.play().catch(() => {});

      intervalId = setInterval(updateProgress, 200);

      iframe.requestFullscreen().catch(() => {});
    });

    // Update progress bar
    function updateProgress() {
      player.getCurrentTime().then(current => {
        player.getDuration().then(duration => {
          const percent = (current / duration) * 100;
          progressBar.style.width = percent + "%";
        });
      });
    }

    // Play/Pause
    playPauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (playing) {
        player.pause().catch(() => {});
        playPauseBtn.textContent = "PLAY";
        playing = false;
      } else {
        player.play().catch(() => {});
        playPauseBtn.textContent = "PAUSE";
        playing = true;
      }
    });

    // Skip back 5s
    skipBack.addEventListener("click", (e) => {
      e.stopPropagation();
      player.getCurrentTime().then(time => {
        player.setCurrentTime(Math.max(time - 5, 0));
      });
    });

    // Skip forward 5s
    skipForward.addEventListener("click", (e) => {
      e.stopPropagation();
      player.getCurrentTime().then(time => {
        player.getDuration().then(duration => {
          player.setCurrentTime(Math.min(time + 5, duration));
        });
      });
    });

    // Timeline seek
    timeline.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = timeline.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;

      player.getDuration().then(duration => {
        player.setCurrentTime(duration * percent);
      });
    });

    // Exit fullscreen
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        clearInterval(intervalId);
        playing = false;
        player.pause().catch(() => {});
      }
    });
  });
});

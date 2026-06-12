(function () {
  var STORAGE_KEY = "home-builds-music";
  var player = document.getElementById("lofi-player");
  var toggle = document.getElementById("music-toggle");
  var icon = document.getElementById("music-icon");
  if (!player || !toggle) return;

  player.volume = 0.35;

  function setIcon(playing) {
    if (icon) icon.textContent = playing ? "🔊" : "🔇";
    toggle.setAttribute("aria-label", playing ? "Mute music" : "Unmute music");
    toggle.setAttribute("title", playing ? "Mute music" : "Play lofi music");
    toggle.classList.toggle("is-playing", playing);
  }

  function tryPlay() {
    return player.play().then(function () {
      setIcon(true);
      localStorage.setItem(STORAGE_KEY, "on");
    }).catch(function () {
      setIcon(false);
      localStorage.setItem(STORAGE_KEY, "off");
    });
  }

  function init() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "on") tryPlay();
    else setIcon(false);
  }

  toggle.addEventListener("click", function () {
    if (player.paused) tryPlay();
    else {
      player.pause();
      setIcon(false);
      localStorage.setItem(STORAGE_KEY, "off");
    }
  });

  init();
})();

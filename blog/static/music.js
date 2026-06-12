(function () {
  var STORAGE_KEY = "home-builds-music";
  var SLUG_KEY = "home-builds-music-slug";
  var TRACK_MAP = {
    ranch: "porchlight-golden-hour",
    "modern-farmhouse": "butter-and-windowlight",
    colonial: "chapter-by-lamplight",
    craftsman: "coffee-ring-notebook",
    contemporary: "glow-on-the-overpass",
    townhouse: "sidewalk-slow-jam",
    mediterranean: "cafe-da-tarde",
    "cape-cod": "harbor-before-words",
    bungalow: "dusk-between-stoops",
    "split-level": "sunset-offbeat",
    victorian: "midnight-amber-room",
    farmhouse: "grandmas-kitchen-on-sunday",
    "mid-century-modern": "platform-after-rain",
    barndominium: "savanna-slow-glow",
    "tiny-home": "first-coffee-thoughts",
    cottage: "sunday-light-through-lace",
    tudor: "candlelit-at-70-bpm",
    "log-cabin": "fireplace-loop",
    coastal: "sea-glass-evening",
    "a-frame": "misty-mountain-sunrise",
    "prairie-style": "first-light-on-the-ridge",
    "spanish-revival": "dusk-on-red-earth",
    "raised-ranch": "window-seat-daydream",
    "dutch-colonial": "linen-and-limoncello",
    georgian: "dust-and-hardcovers",
    minimalist: "almost-floating",
    "modular-prefab": "pixel-quest-save-point",
    scandinavian: "teacup-morning-fog",
    "country-farmhouse": "slow-dancing-by-the-stove",
    federal: "velvet-cigarette-haze",
    "italian-villa": "breezy-afternoon-terrace",
    "queen-anne": "stained-glass-static",
    "passive-house": "green-after-midnight",
    "container-home": "terminal-rain",
    "industrial-loft": "basement-groove-86",
    "english-cottage": "petals-in-the-breeze",
    "eichler-home": "warm-mile-markers",
    "arts-and-crafts": "graphite-in-the-quiet",
    "mission-revival": "midnight-steam-and-mango-skin",
    neoclassical: "last-call-in-c-minor",
    "greek-revival": "saxophone-in-the-rain",
    "gothic-revival": "cathedral-hiss",
    "adobe-pueblo": "moon-over-red-dunes",
    "french-country": "lazy-love-letter-afternoon",
    "pueblo-revival": "misty-steam-quiet-dreams",
    chalet: "snow-on-the-needle",
    "japanese-inspired": "bamboo-shadow-waltz",
    "shotgun-house": "block-party-slow-jam",
    saltbox: "autumn-on-the-window-glass",
    "dome-home": "orbiting-in-silence",
  };

  var player = document.getElementById("lofi-player");
  var toggle = document.getElementById("music-toggle");
  var icon = document.getElementById("music-icon");
  if (!player || !toggle) return;

  player.volume = 0.35;

  function trackForSlug(slug) {
    var track = TRACK_MAP[slug] || TRACK_MAP.ranch;
    return "/audio/" + track + ".mp3";
  }

  function currentSlug() {
    var meta = document.querySelector('meta[name="home-music-slug"]');
    if (meta) return meta.getAttribute("content") || "ranch";
    return localStorage.getItem(SLUG_KEY) || "ranch";
  }

  function setIcon(playing) {
    if (icon) icon.textContent = playing ? "🔊" : "🔇";
    toggle.setAttribute("aria-label", playing ? "Mute music" : "Unmute music");
    toggle.setAttribute("title", playing ? "Mute music" : "Play lofi music");
    toggle.classList.toggle("is-playing", playing);
  }

  function loadTrack(slug, autoplay) {
    var url = trackForSlug(slug);
    if (player.getAttribute("data-current") === url) {
      if (autoplay && player.paused) return player.play().then(function () { setIcon(true); });
      return Promise.resolve();
    }
    player.setAttribute("data-current", url);
    player.src = url;
    localStorage.setItem(SLUG_KEY, slug);
    if (!autoplay) return Promise.resolve();
    return player.play().then(function () {
      setIcon(true);
      localStorage.setItem(STORAGE_KEY, "on");
    }).catch(function () {
      setIcon(false);
    });
  }

  function tryPlay() {
    return loadTrack(currentSlug(), true);
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-music-slug]");
    if (!link) return;
    var slug = link.getAttribute("data-music-slug");
    if (!slug) return;
    localStorage.setItem(SLUG_KEY, slug);
    if (localStorage.getItem(STORAGE_KEY) === "on") {
      loadTrack(slug, true);
    }
  });

  toggle.addEventListener("click", function () {
    if (player.paused) tryPlay();
    else {
      player.pause();
      setIcon(false);
      localStorage.setItem(STORAGE_KEY, "off");
    }
  });

  loadTrack(currentSlug(), localStorage.getItem(STORAGE_KEY) === "on").then(function () {
    if (localStorage.getItem(STORAGE_KEY) !== "on") setIcon(false);
  });
})();

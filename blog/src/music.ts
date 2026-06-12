/** All tracks from Open Lo-Fi (CC0 1.0) — https://github.com/btahir/open-lofi */
export const AUDIO_LICENSE = "CC0 1.0 Universal (public domain). Source: Open Lo-Fi by btahir.";

export const SLUG_TO_TRACK: Record<string, string> = {
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

export function musicUrlForSlug(slug: string): string {
  const track = SLUG_TO_TRACK[slug] || "porchlight-golden-hour";
  return `/audio/${track}.mp3`;
}

export const DEFAULT_MUSIC_SLUG = "ranch";

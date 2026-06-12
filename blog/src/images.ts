import type { HomeImage } from "./data";

/** Verified working Unsplash photo IDs (house / architecture). */
export const VERIFIED_PHOTOS = [
  "photo-1564013799919-ab600027ffc6",
  "photo-1600596542815-ffad4c1539a9",
  "photo-1600585154340-be6161a56a0c",
  "photo-1613490493576-7fde63acd811",
  "photo-1512917774080-9991f1c4c750",
  "photo-1568605114967-8130f3a36994",
  "photo-1570129477492-45c003edd2be",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600607687644-c7171b42498f",
  "photo-1600566752355-35792bedcfea",
  "photo-1600585154526-990dced4db0d",
  "photo-1449844908441-8829872d2607",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1523217582562-09d0def993a6",
  "photo-1500382017468-9049fed747ef",
  "photo-1499793983690-e29da59ef1c2",
  "photo-1507525428034-b723cf961d3e",
  "photo-1506905925346-21bda4d32df4",
  "photo-1560518883-ce09059eeffa",
  "photo-1484154218962-a197022b5858",
  "photo-1513584684374-8bab748fbf90",
  "photo-1582268611958-ebfd161ef9cf",
  "photo-1600585152915-d208bec867a1",
] as const;

const SLIDE_CROPS = ["entropy", "edges", "top", "bottom", "center"] as const;

/** Fallback page tint keyed to each verified cover photo. */
export const THEME_BY_PHOTO: Record<string, string> = {
  "photo-1564013799919-ab600027ffc6": "hsl(38, 42%, 88%)",
  "photo-1600596542815-ffad4c1539a9": "hsl(210, 28%, 90%)",
  "photo-1600585154340-be6161a56a0c": "hsl(200, 22%, 91%)",
  "photo-1613490493576-7fde63acd811": "hsl(28, 35%, 89%)",
  "photo-1512917774080-9991f1c4c750": "hsl(195, 30%, 90%)",
  "photo-1568605114967-8130f3a36994": "hsl(32, 38%, 87%)",
  "photo-1570129477492-45c003edd2be": "hsl(95, 25%, 88%)",
  "photo-1600607687939-ce8a6c25118c": "hsl(205, 26%, 91%)",
  "photo-1600607687644-c7171b42498f": "hsl(218, 24%, 90%)",
  "photo-1600566752355-35792bedcfea": "hsl(42, 32%, 89%)",
  "photo-1600585154526-990dced4db0d": "hsl(185, 35%, 88%)",
  "photo-1449844908441-8829872d2607": "hsl(88, 28%, 88%)",
  "photo-1520250497591-112f2f40a3f4": "hsl(35, 40%, 87%)",
  "photo-1523217582562-09d0def993a6": "hsl(220, 22%, 91%)",
  "photo-1500382017468-9049fed747ef": "hsl(45, 36%, 86%)",
  "photo-1499793983690-e29da59ef1c2": "hsl(30, 30%, 90%)",
  "photo-1507525428034-b723cf961d3e": "hsl(200, 40%, 90%)",
  "photo-1506905925346-21bda4d32df4": "hsl(25, 28%, 89%)",
  "photo-1560518883-ce09059eeffa": "hsl(40, 34%, 88%)",
  "photo-1484154218962-a197022b5858": "hsl(215, 26%, 90%)",
  "photo-1513584684374-8bab748fbf90": "hsl(48, 32%, 88%)",
  "photo-1582268611958-ebfd161ef9cf": "hsl(18, 30%, 90%)",
  "photo-1600585152915-d208bec867a1": "hsl(205, 30%, 90%)",
};

function slugHash(slug: string): number {
  return slug.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
}

function photoUrl(id: string, width: number, crop?: string): string {
  const base = `https://images.unsplash.com/${id}?w=${width}&q=80&auto=format&fit=crop`;
  return crop ? `${base}&crop=${crop}` : base;
}

export function themeForPhotoId(id: string): string {
  return THEME_BY_PHOTO[id] || "hsl(38, 30%, 90%)";
}

export function imageSetForSlug(slug: string, name: string): { heroImage: string; images: HomeImage[]; coverTheme: string } {
  const hash = slugHash(slug);
  const len = VERIFIED_PHOTOS.length;
  const heroId = VERIFIED_PHOTOS[hash % len];
  const heroImage = photoUrl(heroId, 1200);
  const images: HomeImage[] = SLIDE_CROPS.map((crop, i) => {
    const id = VERIFIED_PHOTOS[(hash + i + 1) % len];
    return {
      url: photoUrl(id, 900, crop),
      alt: `${name} home example ${i + 1}`,
    };
  });
  return {
    heroImage,
    images,
    coverTheme: themeForPhotoId(heroId),
  };
}

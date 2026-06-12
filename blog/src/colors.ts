export const MIN_PUBLIC_RATINGS = 10;

function slugHash(slug: string): number {
  return slug.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
}

/** Base background tint for a home style. */
export function baseBgForHome(slug: string): string {
  const hue = (slugHash(slug) * 13) % 360;
  return `hsl(${hue}, 32%, 90%)`;
}

/** Per-slide background tints — varies with each image in the carousel. */
export function slideBgsForHome(slug: string, count: number): string[] {
  const hash = slugHash(slug);
  return Array.from({ length: count }, (_, i) => {
    const hue = (hash * 13 + i * 47) % 360;
    const sat = 28 + (i % 3) * 10;
    const light = 86 + (i % 2) * 6;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  });
}

export function surfaceFromBg(bg: string): string {
  return `color-mix(in srgb, ${bg} 55%, #fffdf9)`;
}

export function borderFromBg(bg: string): string {
  return `color-mix(in srgb, ${bg} 70%, #c4b8a8)`;
}

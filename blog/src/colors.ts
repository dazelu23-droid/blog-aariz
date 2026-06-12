export const MIN_PUBLIC_RATINGS = 10;

export function surfaceFromBg(bg: string): string {
  return `color-mix(in srgb, ${bg} 55%, #fffdf9)`;
}

export function borderFromBg(bg: string): string {
  return `color-mix(in srgb, ${bg} 70%, #c4b8a8)`;
}

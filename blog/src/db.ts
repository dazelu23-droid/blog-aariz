import { HOME_TYPES } from "./data";

export async function ensureHomeData(db: D1Database): Promise<void> {
  const row = (await db.prepare("SELECT COUNT(*) AS c FROM home_types").first()) as { c: number } | null;
  if (!row || row.c > 0) return;

  for (const [i, ht] of HOME_TYPES.entries()) {
    const result = await db
      .prepare(
        "INSERT INTO home_types (slug, name, description, hero_image_url, sort_order) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(ht.slug, ht.name, ht.description, ht.heroImage, i + 1)
      .run();
    const homeTypeId = result.meta.last_row_id;
    for (const [j, img] of ht.images.entries()) {
      await db
        .prepare("INSERT INTO home_images (home_type_id, url, alt, sort_order) VALUES (?, ?, ?, ?)")
        .bind(homeTypeId, img.url, img.alt, j + 1)
        .run();
    }
  }
}

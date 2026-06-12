import { HOME_TYPES } from "./data";

export async function ensureHomeData(db: D1Database): Promise<void> {
  for (const [i, ht] of HOME_TYPES.entries()) {
    const existing = (await db.prepare("SELECT id FROM home_types WHERE slug = ?").bind(ht.slug).first()) as
      | { id: number }
      | null;

    if (existing) {
      await db
        .prepare(
          "UPDATE home_types SET name = ?, description = ?, hero_image_url = ?, origin_name = ?, sort_order = ? WHERE slug = ?",
        )
        .bind(ht.name, ht.description, ht.heroImage, ht.originName ?? null, i + 1, ht.slug)
        .run();

      const imgCount = (await db
        .prepare("SELECT COUNT(*) AS c FROM home_images WHERE home_type_id = ?")
        .bind(existing.id)
        .first()) as { c: number };
      if (imgCount.c > 0) continue;

      for (const [j, img] of ht.images.entries()) {
        await db
          .prepare("INSERT INTO home_images (home_type_id, url, alt, sort_order) VALUES (?, ?, ?, ?)")
          .bind(existing.id, img.url, img.alt, j + 1)
          .run();
      }
      continue;
    }

    const result = await db
      .prepare(
        "INSERT INTO home_types (slug, name, description, hero_image_url, origin_name, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(ht.slug, ht.name, ht.description, ht.heroImage, ht.originName ?? null, i + 1)
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

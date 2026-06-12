import { imageSetForSlug } from "./images";

export interface HomeImage {
  url: string;
  alt: string;
}

export type CostTier = "high" | "moderate" | "low";

export interface HomeTypeData {
  slug: string;
  name: string;
  description: string;
  heroImage: string;
  images: HomeImage[];
  coverTheme: string;
  originName?: string;
  buildRank: number;
  buildCostTier: CostTier;
  buyCostTier: CostTier;
}

function h(
  buildRank: number,
  slug: string,
  name: string,
  description: string,
  buildCostTier: CostTier,
  buyCostTier: CostTier,
  originName?: string,
): HomeTypeData {
  const { heroImage, images, coverTheme } = imageSetForSlug(slug, name);
  return {
    slug,
    name,
    description,
    heroImage,
    images,
    coverTheme,
    originName,
    buildRank,
    buildCostTier,
    buyCostTier,
  };
}

/** Ordered by how often each style is built (rank 1 = most common). */
export const HOME_TYPES: HomeTypeData[] = [
  h(1, "ranch", "Ranch", "Single-story ranch homes stretch wide across the lot with open floor plans and easy indoor-outdoor flow. They are especially popular with families and retirees who want step-free living and a relaxed, approachable feel.", "moderate", "moderate"),
  h(2, "modern-farmhouse", "Modern Farmhouse", "Modern Farmhouse pairs classic gabled silhouettes with black window frames, metal roofs, and crisp white siding. It is the most popular twist on rural style for suburban buyers today.", "moderate", "high", "Farmhouse"),
  h(3, "colonial", "Colonial", "Colonial homes feature symmetrical facades, centered front doors, and evenly spaced windows. This timeless style feels formal and welcoming, with formal living and dining rooms that anchor family gatherings.", "moderate", "moderate"),
  h(4, "craftsman", "Craftsman", "Craftsman bungalows emphasize handcrafted details, low-pitched roofs, and wide front porches supported by tapered columns. Natural materials and built-in woodwork create a warm, artisan character inside and out.", "moderate", "moderate"),
  h(5, "contemporary", "Contemporary", "Contemporary homes embrace clean lines, large glass panels, and open layouts that blur the boundary between inside and out. They suit buyers who want a sleek, current aesthetic with flexible living spaces.", "high", "high"),
  h(6, "townhouse", "Townhouse", "Townhouses share side walls with neighbors, packing multiple floors into a narrow urban or suburban lot. They offer more space than condos with less yard maintenance than detached homes.", "low", "moderate"),
  h(7, "mediterranean", "Mediterranean", "Mediterranean homes draw from Spanish and Italian villas with stucco walls, red tile roofs, and arched doorways. Courtyards, wrought iron, and warm palettes evoke sun-drenched coastal living.", "high", "high"),
  h(8, "cape-cod", "Cape Cod", "Cape Cod homes are compact and symmetrical with steep roofs designed for snow and a central chimney. This New England classic feels snug, efficient, and perfectly suited to coastal or suburban lots.", "moderate", "moderate"),
  h(9, "bungalow", "Bungalow", "Bungalows are modest single-story or one-and-a-half-story homes with efficient layouts and front porches. They are among the most approachable builds for first-time owners and infill lots.", "low", "moderate"),
  h(10, "split-level", "Split-Level", "Split-level homes stagger floors with short flights of stairs between living, sleeping, and garage zones. Common in mid-century suburbs, they separate activity areas without a full two-story climb.", "low", "low"),
  h(11, "victorian", "Victorian", "Victorian homes celebrate ornate trim, bay windows, and wraparound porches from the late 19th century. They appeal to buyers who love character, high ceilings, and richly detailed architecture.", "high", "high"),
  h(12, "farmhouse", "Farmhouse", "Farmhouse style blends rustic siding with bright, airy interiors and practical layouts rooted in rural life. It feels grounded and friendly — like country living updated for everyday comfort.", "moderate", "moderate"),
  h(13, "mid-century-modern", "Mid-Century Modern", "Mid-century modern homes feature flat or low-slope roofs, post-and-beam construction, and walls of glass. They celebrate simplicity, connection to nature, and the optimistic design of the 1950s and 60s.", "moderate", "high"),
  h(14, "barndominium", "Barndominium", "Barndominiums combine steel or wood barn frames with finished living quarters under one roof. They are fast to build, cost-effective per square foot, and popular on rural acreage.", "low", "low"),
  h(15, "tiny-home", "Tiny Home", "Tiny homes maximize every square foot with clever storage, loft sleeping areas, and often wheels for mobility. They suit minimalists and buyers focused on affordability and a smaller environmental footprint.", "low", "low"),
  h(16, "cottage", "Cottage", "Cottage-style homes feel storybook charming with cozy rooms, pitched roofs, and flower-filled gardens. They are ideal for those who want a smaller footprint with personality and a sense of retreat.", "moderate", "moderate"),
  h(17, "tudor", "Tudor", "Tudor revival homes are known for steep gables, decorative half-timbering, and tall chimneys. The style feels historic and distinctive, often found in established neighborhoods with old-world charm.", "high", "high"),
  h(18, "log-cabin", "Log Cabin", "Log cabins use stacked timber walls for a rugged, natural look that fits mountain and lakeside settings. They offer excellent insulation and a retreat atmosphere that feels close to the outdoors.", "moderate", "moderate"),
  h(19, "coastal", "Coastal / Beach House", "Coastal homes are built for sea air and views with elevated foundations, wide decks, and weather-resistant materials. Light colors and open layouts capture breezes and a vacation state of mind year-round.", "high", "high"),
  h(20, "a-frame", "A-Frame", "A-frame houses have steep triangular roofs that run from peak to foundation, creating dramatic vaulted interiors. They are popular as vacation homes and compact builds on sloped terrain.", "moderate", "moderate"),
  h(21, "prairie-style", "Prairie Style", "Prairie style homes, inspired by Frank Lloyd Wright, emphasize horizontal lines, overhanging eaves, and integration with the landscape. Bands of windows and open plans create a calm, grounded presence.", "high", "high"),
  h(22, "spanish-revival", "Spanish Revival", "Spanish Revival homes highlight white stucco, clay tile roofs, and arched windows inspired by colonial Spain. Wrought-iron balconies and courtyards bring drama and shade to warm-climate neighborhoods.", "high", "high", "Mediterranean"),
  h(23, "raised-ranch", "Raised Ranch", "Raised ranch homes enter on a main level with a full lower floor tucked partly below grade. The split entry adds extra square footage without a full two-story street presence.", "low", "low", "Ranch"),
  h(24, "dutch-colonial", "Dutch Colonial", "Dutch Colonial homes are recognized by their broad gambrel roofs that resemble a barn silhouette. The style adds generous headroom upstairs while keeping a friendly, traditional curb appeal.", "moderate", "moderate", "Colonial"),
  h(25, "georgian", "Georgian", "Georgian homes are formal and balanced with brick facades, multi-pane windows, and decorative crowns above the door. They reflect 18th-century English taste adapted for grand American streetscapes.", "high", "high", "Colonial"),
  h(26, "minimalist", "Minimalist", "Minimalist homes strip decoration down to essentials with flat planes, neutral palettes, and precise detailing. Every element is intentional, favoring calm spaces and abundant natural light.", "high", "high", "Contemporary"),
  h(27, "modular-prefab", "Modular / Prefab", "Modular and prefab homes are factory-built in sections then assembled on site for speed and quality control. Designs range from modest cabins to striking contemporary boxes.", "low", "moderate"),
  h(28, "scandinavian", "Scandinavian", "Scandinavian-inspired homes combine light wood, simple forms, and functional layouts that maximize daylight. Hygge-friendly interiors feel uncluttered, warm, and deeply connected to nature.", "moderate", "high", "Contemporary"),
  h(29, "country-farmhouse", "Country Farmhouse", "Country Farmhouse leans more traditional with wraparound porches, wood floors, and apron-front sinks. It feels generations-deep — practical, welcoming, and tied to working land.", "moderate", "moderate", "Farmhouse"),
  h(30, "federal", "Federal", "Federal-style homes refine colonial symmetry with elliptical fanlights, slender columns, and delicate moldings. They feel elegant and restrained, common in historic East Coast cities.", "high", "high", "Colonial"),
  h(31, "italian-villa", "Italian Villa", "Italian Villa style favors symmetrical facades, tall windows, and stone or stucco walls with classical proportions. Terraced gardens and loggias extend living outdoors in a refined Mediterranean manner.", "high", "high", "Mediterranean"),
  h(32, "queen-anne", "Queen Anne", "Queen Anne Victorians are the ornate peak of the era with turrets, patterned shingles, and gingerbread trim. No two facades look alike, making them favorites for preservation-minded owners.", "high", "high", "Victorian"),
  h(33, "passive-house", "Passive House", "Passive House builds prioritize airtight envelopes, thick insulation, and heat-recovery ventilation for extreme efficiency. The contemporary forms prove sustainability and comfort can go hand in hand.", "high", "high", "Contemporary"),
  h(34, "container-home", "Container Home", "Container homes repurpose steel shipping modules into modular living units that can stack or span. They offer a bold contemporary look with fast assembly and a smaller material footprint.", "low", "low", "Contemporary"),
  h(35, "industrial-loft", "Industrial Loft", "Industrial loft conversions expose brick, steel beams, and ductwork inside former warehouses or factories. Open volumes and oversized windows suit urban creatives who want raw character at scale.", "moderate", "high", "Contemporary"),
  h(36, "english-cottage", "English Cottage", "English Cottage style uses stone, thatch or shingle roofs, and irregular massing for a fairy-tale countryside look. Small paned windows and climbing gardens complete the storybook charm.", "moderate", "high", "Cottage"),
  h(37, "eichler-home", "Eichler Home", "Eichler homes are post-and-beam mid-century tract houses with atriums, radiant heat, and walls of glass. They brought modernist design to suburban California at an accessible scale.", "moderate", "high", "Mid-Century Modern"),
  h(38, "arts-and-crafts", "Arts and Crafts", "Arts and Crafts homes prize honest materials, exposed joinery, and designs that reject mass production. Built-in benches, fireplaces, and wood paneling create intimate, craft-forward rooms.", "moderate", "moderate", "Craftsman"),
  h(39, "mission-revival", "Mission Revival", "Mission Revival draws from California's Spanish missions with smooth stucco, parapet walls, and arched arcades. Earth-tone palettes and clay tile give a grounded Southwestern presence.", "moderate", "moderate", "Craftsman"),
  h(40, "neoclassical", "Neoclassical", "Neoclassical homes reference ancient Greece and Rome with grand columns, balanced wings, and formal entries. They suit owners who want stately curb appeal and symmetrical floor plans.", "high", "high", "Colonial"),
  h(41, "greek-revival", "Greek Revival", "Greek Revival homes borrow temple fronts with bold columns, pediments, and white-painted facades. Popular in the 19th century, they still convey permanence and civic grandeur.", "high", "high"),
  h(42, "gothic-revival", "Gothic Revival", "Gothic Revival homes echo medieval churches with pointed arches, steep gables, and decorative bargeboards. They feel romantic and vertical, standing out on tree-lined historic streets.", "high", "high", "Victorian"),
  h(43, "adobe-pueblo", "Adobe / Pueblo", "Adobe and Pueblo homes use thick earthen walls, rounded edges, and flat or parapet roofs for desert climates. Thermal mass keeps interiors cool — a tradition rooted in Indigenous Southwest building.", "low", "moderate"),
  h(44, "french-country", "French Country", "French Country homes blend stone, stucco, and hipped roofs with tall windows and rustic elegance. They evoke provincial manor houses with warm kitchens and vineyard views.", "high", "high"),
  h(45, "pueblo-revival", "Pueblo Revival", "Pueblo Revival mimics Indigenous adobe villages with stepped massing, rounded parapets, and earth tones. Vigas and bancos add Southwest character to modern stucco construction.", "moderate", "moderate", "Adobe / Pueblo"),
  h(46, "chalet", "Chalet / Alpine", "Chalet homes feature wide overhangs, heavy timber, and sloped roofs built to shed deep snow. They evoke Alpine ski lodges with cozy fireplaces and mountain views.", "high", "high"),
  h(47, "japanese-inspired", "Japanese-Inspired", "Japanese-inspired homes use clean lines, natural wood, and sliding screens to connect rooms with gardens. Low profiles and careful craftsmanship create tranquil, meditative living spaces.", "high", "high"),
  h(48, "shotgun-house", "Shotgun House", "Shotgun houses align rooms in a straight line from front to back without hallways. Narrow and efficient, they define historic Southern and Creole neighborhoods with deep community roots.", "low", "low"),
  h(49, "saltbox", "Saltbox", "Saltbox houses have a long, sloping rear roof that originally simplified construction and shed snow. The asymmetrical profile is a Colonial New England hallmark with a cozy, lived-in character.", "moderate", "moderate", "Colonial"),
  h(50, "dome-home", "Dome Home", "Dome homes use curved shells that enclose volume with minimal structural material. They handle wind and snow efficiently and create open, futuristic interiors unlike conventional boxes.", "high", "moderate"),
];

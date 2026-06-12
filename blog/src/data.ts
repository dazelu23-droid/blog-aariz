export interface HomeImage {
  url: string;
  alt: string;
}

export interface HomeTypeData {
  slug: string;
  name: string;
  description: string;
  heroImage: string;
  images: HomeImage[];
  originName?: string;
  buildRank: number;
}

const P = [
  "photo-1564013799919-ab600027ffc6",
  "photo-1600596542815-ffad4c1539a9",
  "photo-1600585154340-be6161a56a0c",
  "photo-1613490493576-7fde63acd811",
  "photo-1512917774080-9991f1c4c750",
  "photo-1605276374101-de4c0a3ff296",
  "photo-1600047509807-ba8f84d040f3",
  "photo-1583608205776-bfd35f0d9f00",
  "photo-1568605114967-8130f3a36994",
  "photo-1570129477492-45c003edd2be",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600607687644-c7171b42498f",
  "photo-1600566753190-17f926baaecd",
  "photo-1600047509358-637dc3f933cd",
  "photo-1600607687929-4e01ac5e6259",
  "photo-1600566752355-35792bedcfea",
  "photo-1600585154526-990dced4db0d",
  "photo-1449844908441-8829872d2607",
  "photo-1518780664697-55e3ad007233",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1523217582562-09d0def993a6",
  "photo-1500382017468-9049fed747ef",
  "photo-1499793983690-e29da59ef1c2",
  "photo-1507525428034-b723cf961d3e",
  "photo-1506905925346-21bda4d32df4",
] as const;

function hero(id: string): string {
  return `https://images.unsplash.com/${id}?w=1200&q=80`;
}

function gallery(name: string, offset: number): HomeImage[] {
  return Array.from({ length: 5 }, (_, i) => {
    const id = P[(offset + i) % P.length];
    return {
      url: `https://images.unsplash.com/${id}?w=800&q=80`,
      alt: `${name} home example ${i + 1}`,
    };
  });
}

function h(
  buildRank: number,
  slug: string,
  name: string,
  description: string,
  photoOffset: number,
  originName?: string,
): HomeTypeData {
  const heroId = P[photoOffset % P.length];
  return {
    slug,
    name,
    description,
    heroImage: hero(heroId),
    images: gallery(name, photoOffset + 1),
    originName,
    buildRank,
  };
}

/** Ordered by how often each style is built (rank 1 = most common). */
export const HOME_TYPES: HomeTypeData[] = [
  h(1, "ranch", "Ranch", "Single-story ranch homes stretch wide across the lot with open floor plans and easy indoor-outdoor flow. They are especially popular with families and retirees who want step-free living and a relaxed, approachable feel.", 0),
  h(2, "modern-farmhouse", "Modern Farmhouse", "Modern Farmhouse pairs classic gabled silhouettes with black window frames, metal roofs, and crisp white siding. It is the most popular twist on rural style for suburban buyers today.", 9, "Farmhouse"),
  h(3, "colonial", "Colonial", "Colonial homes feature symmetrical facades, centered front doors, and evenly spaced windows. This timeless style feels formal and welcoming, with formal living and dining rooms that anchor family gatherings.", 1),
  h(4, "craftsman", "Craftsman", "Craftsman bungalows emphasize handcrafted details, low-pitched roofs, and wide front porches supported by tapered columns. Natural materials and built-in woodwork create a warm, artisan character inside and out.", 2),
  h(5, "contemporary", "Contemporary", "Contemporary homes embrace clean lines, large glass panels, and open layouts that blur the boundary between inside and out. They suit buyers who want a sleek, current aesthetic with flexible living spaces.", 4),
  h(6, "townhouse", "Townhouse", "Townhouses share side walls with neighbors, packing multiple floors into a narrow urban or suburban lot. They offer more space than condos with less yard maintenance than detached homes.", 15),
  h(7, "mediterranean", "Mediterranean", "Mediterranean homes draw from Spanish and Italian villas with stucco walls, red tile roofs, and arched doorways. Courtyards, wrought iron, and warm palettes evoke sun-drenched coastal living.", 3),
  h(8, "cape-cod", "Cape Cod", "Cape Cod homes are compact and symmetrical with steep roofs designed for snow and a central chimney. This New England classic feels snug, efficient, and perfectly suited to coastal or suburban lots.", 7),
  h(9, "bungalow", "Bungalow", "Bungalows are modest single-story or one-and-a-half-story homes with efficient layouts and front porches. They are among the most approachable builds for first-time owners and infill lots.", 11),
  h(10, "split-level", "Split-Level", "Split-level homes stagger floors with short flights of stairs between living, sleeping, and garage zones. Common in mid-century suburbs, they separate activity areas without a full two-story climb.", 16),
  h(11, "victorian", "Victorian", "Victorian homes celebrate ornate trim, bay windows, and wraparound porches from the late 19th century. They appeal to buyers who love character, high ceilings, and richly detailed architecture.", 8),
  h(12, "farmhouse", "Farmhouse", "Farmhouse style blends rustic siding with bright, airy interiors and practical layouts rooted in rural life. It feels grounded and friendly — like country living updated for everyday comfort.", 9),
  h(13, "mid-century-modern", "Mid-Century Modern", "Mid-century modern homes feature flat or low-slope roofs, post-and-beam construction, and walls of glass. They celebrate simplicity, connection to nature, and the optimistic design of the 1950s and 60s.", 10),
  h(14, "barndominium", "Barndominium", "Barndominiums combine steel or wood barn frames with finished living quarters under one roof. They are fast to build, cost-effective per square foot, and popular on rural acreage.", 18),
  h(15, "tiny-home", "Tiny Home", "Tiny homes maximize every square foot with clever storage, loft sleeping areas, and often wheels for mobility. They suit minimalists and buyers focused on affordability and a smaller environmental footprint.", 14),
  h(16, "cottage", "Cottage", "Cottage-style homes feel storybook charming with cozy rooms, pitched roofs, and flower-filled gardens. They are ideal for those who want a smaller footprint with personality and a sense of retreat.", 5),
  h(17, "tudor", "Tudor", "Tudor revival homes are known for steep gables, decorative half-timbering, and tall chimneys. The style feels historic and distinctive, often found in established neighborhoods with old-world charm.", 6),
  h(18, "log-cabin", "Log Cabin", "Log cabins use stacked timber walls for a rugged, natural look that fits mountain and lakeside settings. They offer excellent insulation and a retreat atmosphere that feels close to the outdoors.", 12),
  h(19, "coastal", "Coastal / Beach House", "Coastal homes are built for sea air and views with elevated foundations, wide decks, and weather-resistant materials. Light colors and open layouts capture breezes and a vacation state of mind year-round.", 19),
  h(20, "a-frame", "A-Frame", "A-frame houses have steep triangular roofs that run from peak to foundation, creating dramatic vaulted interiors. They are popular as vacation homes and compact builds on sloped terrain.", 13),
  h(21, "prairie-style", "Prairie Style", "Prairie style homes, inspired by Frank Lloyd Wright, emphasize horizontal lines, overhanging eaves, and integration with the landscape. Bands of windows and open plans create a calm, grounded presence.", 17),
  h(22, "spanish-revival", "Spanish Revival", "Spanish Revival homes highlight white stucco, clay tile roofs, and arched windows inspired by colonial Spain. Wrought-iron balconies and courtyards bring drama and shade to warm-climate neighborhoods.", 3, "Mediterranean"),
  h(23, "raised-ranch", "Raised Ranch", "Raised ranch homes enter on a main level with a full lower floor tucked partly below grade. The split entry adds extra square footage without a full two-story street presence.", 0, "Ranch"),
  h(24, "dutch-colonial", "Dutch Colonial", "Dutch Colonial homes are recognized by their broad gambrel roofs that resemble a barn silhouette. The style adds generous headroom upstairs while keeping a friendly, traditional curb appeal.", 6, "Colonial"),
  h(25, "georgian", "Georgian", "Georgian homes are formal and balanced with brick facades, multi-pane windows, and decorative crowns above the door. They reflect 18th-century English taste adapted for grand American streetscapes.", 1, "Colonial"),
  h(26, "minimalist", "Minimalist", "Minimalist homes strip decoration down to essentials with flat planes, neutral palettes, and precise detailing. Every element is intentional, favoring calm spaces and abundant natural light.", 4, "Contemporary"),
  h(27, "modular-prefab", "Modular / Prefab", "Modular and prefab homes are factory-built in sections then assembled on site for speed and quality control. Designs range from modest cabins to striking contemporary boxes.", 11),
  h(28, "scandinavian", "Scandinavian", "Scandinavian-inspired homes combine light wood, simple forms, and functional layouts that maximize daylight. Hygge-friendly interiors feel uncluttered, warm, and deeply connected to nature.", 12, "Contemporary"),
  h(29, "country-farmhouse", "Country Farmhouse", "Country Farmhouse leans more traditional with wraparound porches, wood floors, and apron-front sinks. It feels generations-deep — practical, welcoming, and tied to working land.", 14, "Farmhouse"),
  h(30, "federal", "Federal", "Federal-style homes refine colonial symmetry with elliptical fanlights, slender columns, and delicate moldings. They feel elegant and restrained, common in historic East Coast cities.", 2, "Colonial"),
  h(31, "italian-villa", "Italian Villa", "Italian Villa style favors symmetrical facades, tall windows, and stone or stucco walls with classical proportions. Terraced gardens and loggias extend living outdoors in a refined Mediterranean manner.", 4, "Mediterranean"),
  h(32, "queen-anne", "Queen Anne", "Queen Anne Victorians are the ornate peak of the era with turrets, patterned shingles, and gingerbread trim. No two facades look alike, making them favorites for preservation-minded owners.", 8, "Victorian"),
  h(33, "passive-house", "Passive House", "Passive House builds prioritize airtight envelopes, thick insulation, and heat-recovery ventilation for extreme efficiency. The contemporary forms prove sustainability and comfort can go hand in hand.", 13, "Contemporary"),
  h(34, "container-home", "Container Home", "Container homes repurpose steel shipping modules into modular living units that can stack or span. They offer a bold contemporary look with fast assembly and a smaller material footprint.", 11, "Contemporary"),
  h(35, "industrial-loft", "Industrial Loft", "Industrial loft conversions expose brick, steel beams, and ductwork inside former warehouses or factories. Open volumes and oversized windows suit urban creatives who want raw character at scale.", 10, "Contemporary"),
  h(36, "english-cottage", "English Cottage", "English Cottage style uses stone, thatch or shingle roofs, and irregular massing for a fairy-tale countryside look. Small paned windows and climbing gardens complete the storybook charm.", 5, "Cottage"),
  h(37, "eichler-home", "Eichler Home", "Eichler homes are post-and-beam mid-century tract houses with atriums, radiant heat, and walls of glass. They brought modernist design to suburban California at an accessible scale.", 10, "Mid-Century Modern"),
  h(38, "arts-and-crafts", "Arts and Crafts", "Arts and Crafts homes prize honest materials, exposed joinery, and designs that reject mass production. Built-in benches, fireplaces, and wood paneling create intimate, craft-forward rooms.", 2, "Craftsman"),
  h(39, "mission-revival", "Mission Revival", "Mission Revival draws from California's Spanish missions with smooth stucco, parapet walls, and arched arcades. Earth-tone palettes and clay tile give a grounded Southwestern presence.", 3, "Craftsman"),
  h(40, "neoclassical", "Neoclassical", "Neoclassical homes reference ancient Greece and Rome with grand columns, balanced wings, and formal entries. They suit owners who want stately curb appeal and symmetrical floor plans.", 1, "Colonial"),
  h(41, "greek-revival", "Greek Revival", "Greek Revival homes borrow temple fronts with bold columns, pediments, and white-painted facades. Popular in the 19th century, they still convey permanence and civic grandeur.", 18),
  h(42, "gothic-revival", "Gothic Revival", "Gothic Revival homes echo medieval churches with pointed arches, steep gables, and decorative bargeboards. They feel romantic and vertical, standing out on tree-lined historic streets.", 15, "Victorian"),
  h(43, "adobe-pueblo", "Adobe / Pueblo", "Adobe and Pueblo homes use thick earthen walls, rounded edges, and flat or parapet roofs for desert climates. Thermal mass keeps interiors cool — a tradition rooted in Indigenous Southwest building.", 16),
  h(44, "french-country", "French Country", "French Country homes blend stone, stucco, and hipped roofs with tall windows and rustic elegance. They evoke provincial manor houses with warm kitchens and vineyard views.", 17),
  h(45, "pueblo-revival", "Pueblo Revival", "Pueblo Revival mimics Indigenous adobe villages with stepped massing, rounded parapets, and earth tones. Vigas and bancos add Southwest character to modern stucco construction.", 16, "Adobe / Pueblo"),
  h(46, "chalet", "Chalet / Alpine", "Chalet homes feature wide overhangs, heavy timber, and sloped roofs built to shed deep snow. They evoke Alpine ski lodges with cozy fireplaces and mountain views.", 12),
  h(47, "japanese-inspired", "Japanese-Inspired", "Japanese-inspired homes use clean lines, natural wood, and sliding screens to connect rooms with gardens. Low profiles and careful craftsmanship create tranquil, meditative living spaces.", 22),
  h(48, "shotgun-house", "Shotgun House", "Shotgun houses align rooms in a straight line from front to back without hallways. Narrow and efficient, they define historic Southern and Creole neighborhoods with deep community roots.", 21),
  h(49, "saltbox", "Saltbox", "Saltbox houses have a long, sloping rear roof that originally simplified construction and shed snow. The asymmetrical profile is a Colonial New England hallmark with a cozy, lived-in character.", 7, "Colonial"),
  h(50, "dome-home", "Dome Home", "Dome homes use curved shells that enclose volume with minimal structural material. They handle wind and snow efficiently and create open, futuristic interiors unlike conventional boxes.", 14),
];

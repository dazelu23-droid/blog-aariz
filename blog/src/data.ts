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
}

const u = (id: string, alt: string): HomeImage => ({
  url: `https://images.unsplash.com/${id}?w=800&q=80`,
  alt,
});

export const HOME_TYPES: HomeTypeData[] = [
  {
    slug: "ranch",
    name: "Ranch",
    description:
      "Single-story ranch homes stretch wide across the lot with open floor plans and easy indoor-outdoor flow. They are especially popular with families and retirees who want step-free living and a relaxed, approachable feel.",
    heroImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
    images: [
      u("photo-1564013799919-ab600027ffc6", "White ranch home with a green lawn"),
      u("photo-1600596542815-ffad4c1539a9", "Modern ranch with large windows"),
      u("photo-1600585154340-be6161a56a0c", "Ranch house with covered patio"),
      u("photo-1613490493576-7fde63acd811", "Suburban ranch with driveway"),
      u("photo-1512917774080-9991f1c4c750", "Ranch home at sunset"),
    ],
  },
  {
    slug: "colonial",
    name: "Colonial",
    description:
      "Colonial homes feature symmetrical facades, centered front doors, and evenly spaced windows. This timeless style feels formal and welcoming, with formal living and dining rooms that anchor family gatherings.",
    heroImage: "https://images.unsplash.com/photo-1605276374101-de4c0a3ff296?w=1200&q=80",
    images: [
      u("photo-1605276374101-de4c0a3ff296", "Classic colonial with columns"),
      u("photo-1600047509807-ba8f84d040f3", "Brick colonial home"),
      u("photo-1583608205776-bfd35f0d9f00", "Colonial house with shutters"),
      u("photo-1568605114967-8130f3a36994", "Two-story colonial exterior"),
      u("photo-1570129477492-45c003edd2be", "Colonial home with front porch"),
    ],
  },
  {
    slug: "craftsman",
    name: "Craftsman",
    description:
      "Craftsman bungalows emphasize handcrafted details, low-pitched roofs, and wide front porches supported by tapered columns. Natural materials and built-in woodwork create a warm, artisan character inside and out.",
    heroImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
    images: [
      u("photo-1568605114967-8130f3a36994", "Craftsman bungalow with porch"),
      u("photo-1600585154526-990dced4db0d", "Craftsman home with stone accents"),
      u("photo-1600566753190-17f926baaecd", "Craftsman exterior with gables"),
      u("photo-1600607687939-ce8a6c25118c", "Craftsman living room with wood trim"),
      u("photo-1600607687644-c7171b42498f", "Craftsman kitchen with built-ins"),
    ],
  },
  {
    slug: "mediterranean",
    name: "Mediterranean",
    description:
      "Mediterranean homes draw from Spanish and Italian villas with stucco walls, red tile roofs, and arched doorways. Courtyards, wrought iron, and warm palettes evoke sun-drenched coastal living.",
    heroImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    images: [
      u("photo-1613490493576-7fde63acd811", "Mediterranean villa with pool"),
      u("photo-1600585154340-be6161a56a0c", "Stucco home with tile roof"),
      u("photo-1600047509358-637dc3f933cd", "Mediterranean courtyard"),
      u("photo-1600607687929-4e01ac5e6259", "Arched entryway Mediterranean home"),
      u("photo-1600566752355-35792bedcfea", "Mediterranean terrace at dusk"),
    ],
  },
  {
    slug: "contemporary",
    name: "Contemporary",
    description:
      "Contemporary homes embrace clean lines, large glass panels, and open layouts that blur the boundary between inside and out. They suit buyers who want a sleek, current aesthetic with flexible living spaces.",
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    images: [
      u("photo-1600607687939-ce8a6c25118c", "Modern contemporary exterior"),
      u("photo-1600607687644-c7171b42498f", "Contemporary open-plan interior"),
      u("photo-1600585154340-be6161a56a0c", "Glass-walled modern home"),
      u("photo-1600566753190-17f926baaecd", "Contemporary home with flat roof"),
      u("photo-1600047509807-ba8f84d040f3", "Minimalist contemporary facade"),
    ],
  },
  {
    slug: "cottage",
    name: "Cottage",
    description:
      "Cottage-style homes feel storybook charming with cozy rooms, pitched roofs, and flower-filled gardens. They are ideal for those who want a smaller footprint with personality and a sense of retreat.",
    heroImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80",
    images: [
      u("photo-1570129477492-45c003edd2be", "Charming cottage with garden"),
      u("photo-1583608205776-bfd35f0d9f00", "Stone cottage in the countryside"),
      u("photo-1512917774080-9991f1c4c750", "Cottage with picket fence"),
      u("photo-1600585154526-990dced4db0d", "Cozy cottage exterior"),
      u("photo-1605276374101-de4c0a3ff296", "English cottage style home"),
    ],
  },
  {
    slug: "tudor",
    name: "Tudor",
    description:
      "Tudor revival homes are known for steep gables, decorative half-timbering, and tall chimneys. The style feels historic and distinctive, often found in established neighborhoods with old-world charm.",
    heroImage: "https://images.unsplash.com/photo-1600047509358-637dc3f933cd?w=1200&q=80",
    images: [
      u("photo-1600047509358-637dc3f933cd", "Tudor home with timber framing"),
      u("photo-1600566752355-35792bedcfea", "Tudor revival with brick"),
      u("photo-1600607687929-4e01ac5e6259", "Tudor house with arched windows"),
      u("photo-1600585154526-990dced4db0d", "Tudor exterior at twilight"),
      u("photo-1564013799919-ab600027ffc6", "Tudor-style suburban home"),
    ],
  },
  {
    slug: "cape-cod",
    name: "Cape Cod",
    description:
      "Cape Cod homes are compact and symmetrical with steep roofs designed for snow and a central chimney. This New England classic feels snug, efficient, and perfectly suited to coastal or suburban lots.",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    images: [
      u("photo-1600585154340-be6161a56a0c", "Cape Cod home with dormers"),
      u("photo-1570129477492-45c003edd2be", "White Cape Cod with shutters"),
      u("photo-1512917774080-9991f1c4c750", "Cape Cod near the coast"),
      u("photo-1583608205776-bfd35f0d9f00", "Cape Cod with picket fence"),
      u("photo-1605276374101-de4c0a3ff296", "Classic Cape Cod exterior"),
    ],
  },
  {
    slug: "victorian",
    name: "Victorian",
    description:
      "Victorian homes celebrate ornate trim, bay windows, and wraparound porches from the late 19th century. They appeal to buyers who love character, high ceilings, and richly detailed architecture.",
    heroImage: "https://images.unsplash.com/photo-1600566753190-17f926baaecd?w=1200&q=80",
    images: [
      u("photo-1600566753190-17f926baaecd", "Painted Victorian with turret"),
      u("photo-1600047509807-ba8f84d040f3", "Victorian with ornate trim"),
      u("photo-1600607687929-4e01ac5e6259", "Victorian porch and gables"),
      u("photo-1600566752355-35792bedcfea", "Historic Victorian street"),
      u("photo-1600585154526-990dced4db0d", "Victorian home at golden hour"),
    ],
  },
  {
    slug: "farmhouse",
    name: "Farmhouse",
    description:
      "Modern farmhouse style blends rustic board-and-batten siding with bright, airy interiors and apron-front sinks. It feels grounded and friendly — like country living updated for everyday comfort.",
    heroImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    images: [
      u("photo-1600585154526-990dced4db0d", "White modern farmhouse"),
      u("photo-1600607687644-c7171b42498f", "Farmhouse kitchen with island"),
      u("photo-1600607687939-ce8a6c25118c", "Farmhouse with black windows"),
      u("photo-1600047509358-637dc3f933cd", "Rustic farmhouse exterior"),
      u("photo-1568605114967-8130f3a36994", "Farmhouse with wraparound porch"),
    ],
  },
  {
    slug: "mid-century-modern",
    name: "Mid-Century Modern",
    description:
      "Mid-century modern homes feature flat or low-slope roofs, post-and-beam construction, and walls of glass. They celebrate simplicity, connection to nature, and the optimistic design of the 1950s and 60s.",
    heroImage: "https://images.unsplash.com/photo-1600607687929-4e01ac5e6259?w=1200&q=80",
    images: [
      u("photo-1600607687929-4e01ac5e6259", "Mid-century home with palm trees"),
      u("photo-1600566752355-35792bedcfea", "Mid-century modern at dusk"),
      u("photo-1600585154340-be6161a56a0c", "Mid-century with carport"),
      u("photo-1600047509807-ba8f84d040f3", "Mid-century flat roof design"),
      u("photo-1613490493576-7fde63acd811", "Mid-century poolside home"),
    ],
  },
  {
    slug: "bungalow",
    name: "Bungalow",
    description:
      "Bungalows are modest single-story or one-and-a-half-story homes with efficient layouts and front porches. They are among the most approachable builds for first-time owners and infill lots.",
    heroImage: "https://images.unsplash.com/photo-1600047509807-ba8f84d040f3?w=1200&q=80",
    images: [
      u("photo-1600047509807-ba8f84d040f3", "Classic bungalow with porch"),
      u("photo-1568605114967-8130f3a36994", "Bungalow with gabled roof"),
      u("photo-1570129477492-45c003edd2be", "Charming bungalow garden"),
      u("photo-1583608205776-bfd35f0d9f00", "Bungalow with stone path"),
      u("photo-1512917774080-9991f1c4c750", "Bungalow neighborhood"),
    ],
  },
  {
    slug: "log-cabin",
    name: "Log Cabin",
    description:
      "Log cabins use stacked timber walls for a rugged, natural look that fits mountain and lakeside settings. They offer excellent insulation and a retreat atmosphere that feels close to the outdoors.",
    heroImage: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80",
    images: [
      u("photo-1449844908441-8829872d2607", "Log cabin in the forest"),
      u("photo-1518780664697-55e3ad007233", "Rustic log cabin exterior"),
      u("photo-1470770903676-69b98201ea1c", "Log cabin by a lake"),
      u("photo-1501785888041-af3ef285b470", "Mountain log cabin"),
      u("photo-1464822759023-fed622ff2c3b", "Snowy log cabin retreat"),
    ],
  },
  {
    slug: "a-frame",
    name: "A-Frame",
    description:
      "A-frame houses have steep triangular roofs that run from peak to foundation, creating dramatic vaulted interiors. They are popular as vacation homes and compact builds on sloped terrain.",
    heroImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    images: [
      u("photo-1520250497591-112f2f40a3f4", "A-frame cabin in the woods"),
      u("photo-1542718610-a1d656d1884c", "A-frame with large windows"),
      u("photo-1506905925346-21bda4d32df4", "Mountain A-frame home"),
      u("photo-1510798837691-316f588fa47e", "A-frame by the water"),
      u("photo-1504280390367-361c6d9f38f4", "Modern A-frame exterior"),
    ],
  },
  {
    slug: "tiny-home",
    name: "Tiny Home",
    description:
      "Tiny homes maximize every square foot with clever storage, loft sleeping areas, and often wheels for mobility. They suit minimalists and buyers focused on affordability and a smaller environmental footprint.",
    heroImage: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80",
    images: [
      u("photo-1523217582562-09d0def993a6", "Tiny home on wheels"),
      u("photo-1570129477492-45c003edd2be", "Compact tiny house exterior"),
      u("photo-1600585154526-990dced4db0d", "Modern tiny home design"),
      u("photo-1600607687644-c7171b42498f", "Tiny home interior kitchen"),
      u("photo-1600607687939-ce8a6c25118c", "Tiny home loft bedroom"),
    ],
  },
  {
    slug: "townhouse",
    name: "Townhouse",
    description:
      "Townhouses share side walls with neighbors, packing multiple floors into a narrow urban or suburban lot. They offer more space than condos with less yard maintenance than detached homes.",
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    images: [
      u("photo-1600596542815-ffad4c1539a9", "Row of modern townhouses"),
      u("photo-1600566753190-17f926baaecd", "Urban townhouse street"),
      u("photo-1600047509358-637dc3f933cd", "Brick townhouse row"),
      u("photo-1605276374101-de4c0a3ff296", "Townhouse with garage"),
      u("photo-1564013799919-ab600027ffc6", "Suburban townhouse community"),
    ],
  },
  {
    slug: "split-level",
    name: "Split-Level",
    description:
      "Split-level homes stagger floors with short flights of stairs between living, sleeping, and garage zones. Common in mid-century suburbs, they separate activity areas without a full two-story climb.",
    heroImage: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80",
    images: [
      u("photo-1600566752355-35792bedcfea", "Split-level suburban home"),
      u("photo-1600585154340-be6161a56a0c", "Split-level with front steps"),
      u("photo-1600047509807-ba8f84d040f3", "Split-level brick exterior"),
      u("photo-1570129477492-45c003edd2be", "Split-level with driveway"),
      u("photo-1512917774080-9991f1c4c750", "Split-level at sunset"),
    ],
  },
  {
    slug: "prairie-style",
    name: "Prairie Style",
    description:
      "Prairie style homes, inspired by Frank Lloyd Wright, emphasize horizontal lines, overhanging eaves, and integration with the landscape. Bands of windows and open plans create a calm, grounded presence.",
    heroImage: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80",
    images: [
      u("photo-1600607687644-c7171b42498f", "Prairie style horizontal lines"),
      u("photo-1600607687939-ce8a6c25118c", "Prairie home with flat roof"),
      u("photo-1600585154526-990dced4db0d", "Prairie style with stone"),
      u("photo-1600566753190-17f926baaecd", "Prairie home in landscape"),
      u("photo-1600047509358-637dc3f933cd", "Prairie style windows"),
    ],
  },
  {
    slug: "barndominium",
    name: "Barndominium",
    description:
      "Barndominiums combine steel or wood barn frames with finished living quarters under one roof. They are fast to build, cost-effective per square foot, and popular on rural acreage.",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    images: [
      u("photo-1500382017468-9049fed747ef", "Barndominium on open land"),
      u("photo-1464226184888-fa80b87dee38", "Metal barn-style home"),
      u("photo-1416331108676-a22ccb276e35", "Rural barndominium exterior"),
      u("photo-1501594907352-04cda38ccbc6", "Modern barn home design"),
      u("photo-1600585154340-be6161a56a0c", "Barndominium with porch"),
    ],
  },
  {
    slug: "coastal",
    name: "Coastal / Beach House",
    description:
      "Coastal homes are built for sea air and views with elevated foundations, wide decks, and weather-resistant materials. Light colors and open layouts capture breezes and a vacation state of mind year-round.",
    heroImage: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80",
    images: [
      u("photo-1499793983690-e29da59ef1c2", "Beach house by the ocean"),
      u("photo-1512917774080-9991f1c4c750", "Coastal home with deck"),
      u("photo-1507525428034-b723cf961d3e", "Beachfront property"),
      u("photo-1473496160054-6234557a7992", "Coastal cottage exterior"),
      u("photo-1506905925346-21bda4d32df4", "Seaside home with view"),
    ],
  },
];

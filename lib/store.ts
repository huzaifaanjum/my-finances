// Things your Manulife benefits pay for, from brands' own Canadian stores (prices in CAD, checked Nov 6, 2026).
// Prices change and sales end; the link always goes to the live product page.

export const STORE_CHECKED = "Nov 6, 2026";
/** GST + QST in Quebec; receipts include it and the claim covers it. */
export const QC_SALES_TAX = 0.14975;

/**
 * Which benefit pays. "lsa" is the $500 Lifestyle Spending Account; "vision" is extended health's
 * glasses-or-contacts limit, with the spending account covering what's left (it accepts health costs the core plan doesn't pay).
 */
export type StoreBenefit = "lsa" | "vision";

export type StoreCategory = "fitness" | "shoes" | "recovery" | "wearables" | "sleep" | "vision" | "dental" | "supplements" | "learning";

export const STORE_CATEGORIES: { id: StoreCategory; label: string }[] = [
  { id: "fitness", label: "Fitness" },
  { id: "shoes", label: "Running shoes" },
  { id: "recovery", label: "Recovery" },
  { id: "wearables", label: "Fitness trackers" },
  { id: "sleep", label: "Sleep" },
  { id: "vision", label: "Glasses & contacts" },
  { id: "dental", label: "Dental" },
  { id: "supplements", label: "Supplements" },
  { id: "learning", label: "Learning" },
];

export interface StoreItem {
  id: string;
  name: string;
  brand: string;
  category: StoreCategory;
  benefit: StoreBenefit;
  /** before sales tax, in CAD */
  price: number;
  /** regular price when it's on sale */
  was?: number;
  /** "from" when the price is the cheapest size or option */
  from?: boolean;
  /** "a year" for memberships */
  per?: string;
  image: string;
  url: string;
  /** the line on Manulife's eligible list it falls under */
  why: string;
}

export const STORE: StoreItem[] = [
  {
    id: "bowflex-552",
    name: "SelectTech 552 adjustable dumbbells",
    brand: "Bowflex",
    category: "fitness",
    benefit: "lsa",
    price: 599,
    image: "https://cdn.shopify.com/s/files/1/0643/9570/6437/files/results-series-552-dumbbell-man-exercising.jpg",
    url: "https://www.bowflex.ca/products/bowflex-results-series-552-selecttech-dumbbells",
    why: "Fitness equipment",
  },
  {
    id: "bowflex-1090",
    name: "SelectTech 1090 adjustable dumbbells",
    brand: "Bowflex",
    category: "fitness",
    benefit: "lsa",
    price: 999,
    image: "https://cdn.shopify.com/s/files/1/0643/9570/6437/files/results-series-1090-dumbbell-pair-black-blue.jpg",
    url: "https://www.bowflex.ca/products/bowflex-results-series-1090-selecttech-dumbbells",
    why: "Fitness equipment",
  },
  {
    id: "econofitness",
    name: "Gym membership, 75+ gyms in Quebec",
    brand: "Éconofitness",
    category: "fitness",
    benefit: "lsa",
    price: 129.75,
    from: true,
    per: "a year",
    image:
      "https://d33qu2wf6dqm9z.cloudfront.net/eyJidWNrZXQiOiJlY29ub2ZpdG5lc3MtYXNzZXRzIiwia2V5IjoicHJvZHVjdGlvbi9BY2N1ZWlsL2ltYWdlLWFjY3VlaWwuanBnIiwiZWRpdHMiOnsianBlZyI6eyJxdWFsaXR5Ijo4MiwicHJvZ3Jlc3NpdmUiOmZhbHNlLCJ0cmVsbGlzUXVhbnRpc2F0aW9uIjp0cnVlLCJvdmVyc2hvb3REZXJpbmdpbmciOnRydWUsIm9wdGltaXplU2NhbnMiOnRydWV9LCJyZXNpemUiOnsid2lkdGgiOjEyMDAsImhlaWdodCI6NjMwLCJmaXQiOiJpbnNpZGUifX19?mtime=1749734524",
    url: "https://www.econofitness.ca/en",
    why: "Gym and health club",
  },
  {
    id: "allbirds-tree-runner",
    name: "Men's Tree Runners",
    brand: "Allbirds",
    category: "shoes",
    benefit: "lsa",
    price: 70,
    was: 140,
    image: "https://cdn.shopify.com/s/files/1/0806/5967/7504/files/A10091M080_SHOE_PROFILE_GLOBAL_MENS_TREE_RUNNER_ARID_UMBER_BLIZZARD_ab75cbf7-d12a-40c7-84d9-5134da7393e5.png",
    url: "https://www.allbirds.ca/products/mens-tree-runners-arid-umber",
    why: "Running shoes",
  },
  {
    id: "allbirds-tree-dasher",
    name: "Men's Tree Dasher 2",
    brand: "Allbirds",
    category: "shoes",
    benefit: "lsa",
    price: 92.5,
    was: 185,
    image: "https://cdn.shopify.com/s/files/1/0806/5967/7504/files/AA000UM_SHOE_LEFT_GLOBAL_MENS_TREE_DASHER_2.0_Medium_Grey_Light_Grey_15848959-016f-47a9-a558-ecd3254f004e.png",
    url: "https://www.allbirds.ca/products/mens-tree-dashers-medium-grey",
    why: "Running shoes",
  },
  {
    id: "allbirds-wool-mid-wp",
    name: "Men's Wool Runner NZ Mid Waterproof",
    brand: "Allbirds",
    category: "shoes",
    benefit: "lsa",
    price: 100,
    was: 200,
    image: "https://cdn.shopify.com/s/files/1/0806/5967/7504/files/A12008_25Q3_Wool-Runner-NZ-Mid-Waterproof-Dark-Jungle-Dark-Jungle-Sole_PDP_LEFT.jpg",
    url: "https://www.allbirds.ca/products/mens-wool-runner-nz-mid-waterproof-dark-jungle",
    why: "Hiking gear",
  },
  {
    id: "theragun-mini",
    name: "Theragun Mini massage gun",
    brand: "Therabody",
    category: "recovery",
    benefit: "lsa",
    price: 269.99,
    image: "https://cdn.shopify.com/s/files/1/0644/5944/0201/files/Y2K-Mini-Blue-Raspberry-Thumbnail.webp",
    url: "https://www.therabody.ca/products/theragun-mini-blue-raspberry",
    why: "Massage units",
  },
  {
    id: "theragun-mini-plus",
    name: "Theragun Mini Plus massage gun",
    brand: "Therabody",
    category: "recovery",
    benefit: "lsa",
    price: 349.99,
    image: "https://cdn.shopify.com/s/files/1/0644/5944/0201/files/Theragun-Mini-Plus-PLP-Thumbnail-1.webp",
    url: "https://www.therabody.ca/products/theragun-mini-plus-massage-gun",
    why: "Massage units",
  },
  {
    id: "theragun-prime",
    name: "Theragun Prime massage gun",
    brand: "Therabody",
    category: "recovery",
    benefit: "lsa",
    price: 429.99,
    image: "https://cdn.shopify.com/s/files/1/0644/5944/0201/files/Theragun-Prime-Navy-PLP-Thumbnail-1.webp",
    url: "https://www.therabody.ca/products/theragun-prime-gen-6-massage-gun-navy",
    why: "Massage units",
  },
  {
    id: "garmin-fr265",
    name: "Forerunner 265 GPS running watch",
    brand: "Garmin",
    category: "wearables",
    benefit: "lsa",
    price: 659.99,
    image: "https://res.garmin.com/en/products/010-02810-01/v/cf-lg.jpg",
    url: "https://www.garmin.com/en-CA/p/886785",
    why: "Fitness trackers",
  },
  {
    id: "garmin-fr965",
    name: "Forerunner 965 GPS running watch",
    brand: "Garmin",
    category: "wearables",
    benefit: "lsa",
    price: 869.99,
    image: "https://res.garmin.com/en/products/010-02809-01/v/cf-lg.jpg",
    url: "https://www.garmin.com/en-CA/p/886725",
    why: "Fitness trackers",
  },
  {
    id: "garmin-cirqa",
    name: "CIRQA smart band",
    brand: "Garmin",
    category: "wearables",
    benefit: "lsa",
    price: 279.99,
    image: "https://res.garmin.com/en/products/010-04675-00/v/cf-lg.jpg",
    url: "https://www.garmin.com/en-CA/p/1989182",
    why: "Fitness trackers",
  },
  {
    id: "endy-mattress",
    name: "Endy Mattress",
    brand: "Endy",
    category: "sleep",
    benefit: "lsa",
    price: 675,
    from: true,
    image: "https://cdn.sanity.io/images/d0kd7r9c/production/09caca52a0400db2a382f38221fee54a1661c066-1720x1038.jpg?rect=0,68,1720,903&w=1200&h=630",
    url: "https://endy.com/products/endy-mattress",
    why: "Mattress",
  },
  {
    id: "bonlook-imagine",
    name: "Imagine prescription glasses",
    brand: "BonLook",
    category: "vision",
    benefit: "vision",
    price: 169,
    from: true,
    image: "https://cdn.shopify.com/s/files/1/0366/3072/4667/files/Imagine_Crystal_Front_O.jpg",
    url: "https://www.bonlook.ca/products/imagine-eyeglasses",
    why: "Glasses or contacts",
  },
  {
    id: "bonlook-edmond",
    name: "Edmond prescription glasses",
    brand: "BonLook",
    category: "vision",
    benefit: "vision",
    price: 169,
    from: true,
    image: "https://cdn.shopify.com/s/files/1/0366/3072/4667/files/Edmond_Canyon_Front_O.jpg",
    url: "https://www.bonlook.ca/products/edmond-eyeglasses",
    why: "Glasses or contacts",
  },
  {
    id: "ollie-drift",
    name: "Drift prescription glasses",
    brand: "Ollie Quinn",
    category: "vision",
    benefit: "vision",
    price: 99,
    from: true,
    image: "https://cdn.shopify.com/s/files/1/1713/9097/files/drifthavana.png",
    url: "https://www.olliequinn.com/products/drift-1",
    why: "Glasses or contacts",
  },
  {
    id: "ollie-nelson",
    name: "Nelson Titanium prescription glasses",
    brand: "Ollie Quinn",
    category: "vision",
    benefit: "vision",
    price: 134,
    from: true,
    image: "https://cdn.shopify.com/s/files/1/1713/9097/files/NelsonGold.png",
    url: "https://www.olliequinn.com/products/nelson-titanium-1",
    why: "Glasses or contacts",
  },
  {
    id: "acuvue-oasys",
    name: "Acuvue Oasys contact lenses, 12 pack",
    brand: "Clearly",
    category: "vision",
    benefit: "vision",
    price: 62.04,
    was: 72.99,
    image: "https://assets2.clearly.ca/prod-onecp-record-files/picontactlenses/d98d49c4-3425-464d-b39d-b35500ba4cfa/JJJJACOS012__shad__fr2.png",
    url: "https://clearly.ca/en-ca/contact-lenses/johnson-and-johnson/acuvue-oasys-with-hydraclear-plus-technology-12",
    why: "Glasses or contacts",
  },
  {
    id: "waterpik-660",
    name: "Aquarius water flosser WP-660",
    brand: "Waterpik",
    category: "dental",
    benefit: "lsa",
    price: 119.55,
    image: "https://www.waterpik.ca/en/oral-health/products/images/waterpik-aquarius-water-flosser-wp-660-white.jpg",
    url: "https://www.waterpik.ca/en/oral-health/products/dental-water-flosser/WP-660/",
    why: "Water flosser",
  },
  {
    id: "organika-magnesium",
    name: "Magnesium 3-in-1 Complex, 180 capsules",
    brand: "Organika",
    category: "supplements",
    benefit: "lsa",
    price: 32.19,
    was: 45.99,
    image: "https://cdn.shopify.com/s/files/1/0355/5537/7197/files/magnesium-3-in-1-complex-180-vegetarian-capsules-4370-8607654.png",
    url: "https://www.organika.com/products/magnesium-3-in-1-complex",
    why: "Vitamins and supplements",
  },
  {
    id: "organika-collagen",
    name: "Enhanced Collagen Protein, chai",
    brand: "Organika",
    category: "supplements",
    benefit: "lsa",
    price: 34.49,
    image: "https://cdn.shopify.com/s/files/1/0355/5537/7197/files/enhanced-collagen-protein-chai-chai-253-g-4292-1111882.png",
    url: "https://www.organika.com/products/enhanced-collagen-protein%E2%84%A2-chai",
    why: "Vitamins and supplements",
  },
  {
    id: "ipad",
    name: "iPad",
    brand: "Apple",
    category: "learning",
    benefit: "lsa",
    price: 649,
    from: true,
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-model-unselect-gallery-1-202503?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1739318772336",
    url: "https://www.apple.com/ca/shop/buy-ipad/ipad",
    why: "Computer and software",
  },
  {
    id: "coursera-plus",
    name: "Coursera Plus, unlimited courses",
    brand: "Coursera",
    category: "learning",
    benefit: "lsa",
    price: 341.4,
    was: 569,
    per: "a year",
    image: "https://s3.amazonaws.com/coursera/media/Grid_Coursera_Partners_updated.png",
    url: "https://www.coursera.org/courseraplus",
    why: "Professional course fees",
  },
];

export interface Claim {
  /** price with Quebec sales tax, what the receipt shows */
  total: number;
  /** from extended health's glasses-or-contacts limit */
  vision: number;
  /** from the Lifestyle Spending Account */
  lsa: number;
  /** what's left for you to pay */
  you: number;
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Buying several items one after another: each draws down the same spending account and vision limit,
 * so later items may get less than they would on their own.
 */
export function claimAll(items: StoreItem[], lsaLeft: number, visionLeft: number): { claims: Claim[]; total: Claim } {
  let lsa = lsaLeft;
  let vision = visionLeft;
  const claims = items.map((item) => {
    const c = claimFor(item, lsa, vision);
    lsa -= c.lsa;
    vision -= c.vision;
    return c;
  });
  const sum = (k: keyof Claim) => r2(claims.reduce((t, c) => t + c[k], 0));
  return { claims, total: { total: sum("total"), vision: sum("vision"), lsa: sum("lsa"), you: sum("you") } };
}

/** What you can claim on one item, given what's left in each benefit. */
export function claimFor(item: StoreItem, lsaLeft: number, visionLeft: number): Claim {
  const total = r2(item.price * (1 + QC_SALES_TAX));
  const vision = item.benefit === "vision" ? Math.min(total, Math.max(0, visionLeft)) : 0;
  const lsa = Math.min(total - vision, Math.max(0, lsaLeft));
  return { total, vision: r2(vision), lsa: r2(lsa), you: r2(total - vision - lsa) };
}

/* ==========================================================================
   Game ID — Sanitized Demo & Dummy Data (Safe for GitHub / GitHub Pages)
   Zero personal identifiable information (PII).
   ========================================================================== */

export const DUMMY_CONFIG = {
  app: {
    name: "Game Library",
    defaultAccount: "B",
    defaultView: "grid",
    defaultSort: "title-asc"
  },
  accounts: [
    {
      id: "A",
      label: "Demo Account A",
      dataFile: "accountA.json",
      entitlements: 12
    },
    {
      id: "B",
      label: "Demo Account B",
      dataFile: "accountB.json",
      entitlements: 24
    }
  ],
  assets: {
    priority: [
      "IGDB",
      "Official store artwork",
      "Steam capsule",
      "Local placeholder"
    ],
    placeholders: {
      cover: "assets/placeholders/cover.svg",
      background: "assets/placeholders/background.svg"
    }
  },
  monetary: {
    primaryMetric: "pricing.current",
    primaryMetricLabel: "Current store value",
    lowProminenceMetric: "ownership.purchasePrice",
    note: "Purchase price is ownership metadata and renders de-emphasised."
  },
  unavailableSources: {
    igdb: "IGDB API demo mode",
    opencritic: "OpenCritic demo mode",
    isthereanydeal: "IsThereAnyDeal demo mode",
    howlongtobeat: "HowLongToBeat demo mode"
  }
};

export const DUMMY_GENRES = {
  source: "Steam store genres (Demo mode)",
  genres: [
    { name: "Action", slug: "action", counts: { A: 10, B: 20 } },
    { name: "Adventure", slug: "adventure", counts: { A: 8, B: 15 } },
    { name: "Indie", slug: "indie", counts: { A: 7, B: 14 } },
    { name: "RPG", slug: "rpg", counts: { A: 5, B: 12 } },
    { name: "Strategy", slug: "strategy", counts: { A: 4, B: 9 } },
    { name: "Casual", slug: "casual", counts: { A: 3, B: 8 } },
    { name: "Simulation", slug: "simulation", counts: { A: 3, B: 7 } },
    { name: "Free To Play", slug: "free_to_play", counts: { A: 2, B: 6 } }
  ]
};

export const DUMMY_PROFILE = {
  id: "epic_demo_8a7d3f2e1c0b",
  label: "Demo Gamer (Demo Account)",
  displayName: "GamerOne",
  firstName: "Alex",
  lastName: "Rivera",
  fullName: "Alex Rivera",
  email: "alex.gamer@example.com",
  country: "US",
  createdAt: "1/15/2021",
  lastLogin: "9/9/2026",
  status: "ACTIVE",
  language: "English",
  addresses: [
    "123 Gaming Blvd, Suite 400, Austin, TX 78701, US"
  ],
  connectedAccounts: [
    {
      authType: "github",
      externalAuthId: "alex-coder",
      externalDisplayName: "alex-coder",
      addedDate: "5/2/2024"
    },
    {
      authType: "google",
      externalAuthId: "109876543210987654321",
      externalDisplayName: "Alex Rivera",
      addedDate: "6/18/2023"
    },
    {
      authType: "steam",
      externalAuthId: "76561198000000000",
      externalDisplayName: "AlexGaming",
      addedDate: "4/15/2022"
    },
    {
      authType: "ubisoft",
      externalAuthId: "u8b9a1c2-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
      externalDisplayName: "alex_uplay",
      addedDate: "3/10/2022"
    }
  ],
  communicationMethods: [
    {
      method: "SMS",
      identifier: "+15550198234",
      metadata: "Verified: true"
    },
    {
      method: "Email",
      identifier: "alex.gamer@example.com",
      metadata: null
    }
  ],
  agreements: [
    {
      agreementTitle: "EPIC GAMES PRIVACY POLICY",
      status: "Accepted",
      date: "12/31/2025"
    },
    {
      agreementTitle: "EPIC GAMES STORE END USER LICENSE AGREEMENT",
      status: "Accepted",
      date: "2/11/2025"
    }
  ],
  entitlementCount: 24,
  consentedAppsCount: 18,
  social: {
    friendsCount: 12,
    incomingFriendRequests: 3,
    outgoingFriendRequests: 1,
    blocked: 0,
    friendRequestsPrivacy: "Everybody",
    mutualFriendsVisibility: "Everybody"
  }
};

export const DUMMY_GAMES_A = [
  {
    id: "demo_a_rustler_1",
    title: "Rustler - Grand Theft Horse",
    rawTitle: "Rustler - Grand Theft Horse",
    store: "Epic Games Store",
    classification: "game",
    cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/844240/header.jpg",
    background: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/844240/page_bg_generated_v6b.jpg",
    screenshots: [],
    developer: "Jutsu Games",
    publisher: "Modus Games",
    franchise: null,
    releaseDate: "Feb 18, 2021",
    genres: ["Action", "Adventure", "Indie"],
    themes: [],
    tags: ["Open World", "Medieval", "Comedy"],
    platforms: ["windows"],
    summary: "Rustler is an open-world, top-down action game paying tribute to the good old GTA style.",
    about: null,
    ratings: { metacritic: 68, steam: 77, steamReviewCount: 1240, igdbCritic: 70, igdbUser: 72, opencritic: null },
    pricing: { currency: "USD", msrp: 24.99, current: 24.99, discountPercent: null, historicalLowest: 4.99 },
    isFree: false,
    features: { achievements: true },
    steamDeck: null,
    ownership: { purchaseDate: "Jan 25, 2024", purchasePrice: 0.00, marketplace: "Epic Games Store", transactionId: "DEMO_ORD_A01", playtimeSeconds: 3600, playtimeRaw: "1" },
    provenance: { confidence: "High", sources: ["Epic Games Account Export", "Receipt email"], issues: [], steamAppId: 844240, igdbId: null, steamStatus: "exact", igdbStatus: "skipped_no_credentials" }
  },
  {
    id: "demo_a_total_war_2",
    title: "Total War: THREE KINGDOMS",
    rawTitle: "Total War: THREE KINGDOMS",
    store: "Epic Games Store",
    classification: "game",
    cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/779340/header.jpg",
    background: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/779340/page_bg_generated_v6b.jpg",
    screenshots: [],
    developer: "CREATIVE ASSEMBLY",
    publisher: "SEGA",
    franchise: "Total War",
    releaseDate: "May 23, 2019",
    genres: ["Strategy", "Action"],
    themes: [],
    tags: ["Historical", "Grand Strategy", "Turn-Based"],
    platforms: ["windows", "mac", "linux"],
    summary: "Total War: THREE KINGDOMS is the first in the award-winning series to recreate epic conflict across ancient China.",
    about: null,
    ratings: { metacritic: 85, steam: 82, steamReviewCount: 54200, igdbCritic: 86, igdbUser: 84, opencritic: null },
    pricing: { currency: "USD", msrp: 59.99, current: 59.99, discountPercent: null, historicalLowest: 19.99 },
    isFree: false,
    features: { achievements: true },
    steamDeck: null,
    ownership: { purchaseDate: "Jan 1, 2024", purchasePrice: 0.00, marketplace: "Epic Games Store", transactionId: "DEMO_ORD_A02", playtimeSeconds: 7200, playtimeRaw: "2" },
    provenance: { confidence: "High", sources: ["Epic Games Account Export", "Receipt email"], issues: [], steamAppId: 779340, igdbId: null, steamStatus: "exact", igdbStatus: "skipped_no_credentials" }
  },
  {
    id: "demo_a_trine_3",
    title: "Trine Classic Collection",
    rawTitle: "Trine Classic Collection",
    store: "Epic Games Store",
    classification: "game",
    cover: "assets/placeholders/cover.svg",
    background: "assets/placeholders/background.svg",
    screenshots: [],
    developer: "Frozenbyte",
    publisher: "Frozenbyte",
    franchise: "Trine",
    releaseDate: "Dec 31, 2020",
    genres: ["Adventure", "Platformer", "Puzzle"],
    themes: [],
    tags: ["Co-op", "Physics", "Fantasy"],
    platforms: ["windows"],
    summary: "Experience the complete Trine adventure in stunning fantasy environments.",
    about: null,
    ratings: { metacritic: 80, steam: 88, steamReviewCount: 8900, igdbCritic: 81, igdbUser: 83, opencritic: null },
    pricing: { currency: "USD", msrp: 29.99, current: 29.99, discountPercent: null, historicalLowest: 7.49 },
    isFree: false,
    features: { achievements: true },
    steamDeck: null,
    ownership: { purchaseDate: "Dec 31, 2023", purchasePrice: 0.00, marketplace: "Epic Games Store", transactionId: "DEMO_ORD_A03", playtimeSeconds: 0, playtimeRaw: "0" },
    provenance: { confidence: "High", sources: ["Epic Games Account Export"], issues: [], steamAppId: null, igdbId: null, steamStatus: "exact", igdbStatus: "skipped_no_credentials" }
  },
  {
    id: "demo_a_fall_guys_4",
    title: "Fall Guys",
    rawTitle: "Fall Guys",
    store: "Epic Games Store",
    classification: "game",
    cover: "assets/placeholders/cover.svg",
    background: "assets/placeholders/background.svg",
    screenshots: [],
    developer: "Mediatonic",
    publisher: "Epic Games",
    franchise: null,
    releaseDate: "Jun 21, 2022",
    genres: ["Action", "Party", "Casual"],
    themes: [],
    tags: ["Multiplayer", "Battle Royale", "Funny"],
    platforms: ["windows"],
    summary: "Fall Guys is a free, cross-platform, massive multiplayer, party royale game.",
    about: null,
    ratings: { metacritic: 80, steam: 81, steamReviewCount: 390000, igdbCritic: 80, igdbUser: 78, opencritic: null },
    pricing: { currency: "USD", msrp: 0.00, current: 0.00, discountPercent: null, historicalLowest: 0.00 },
    isFree: true,
    features: {},
    steamDeck: null,
    ownership: { purchaseDate: "Jun 21, 2022", purchasePrice: 0.00, marketplace: "Epic Games Store", transactionId: "DEMO_ORD_A04", playtimeSeconds: 10800, playtimeRaw: "3" },
    provenance: { confidence: "High", sources: ["Epic Games Account Export"], issues: [], steamAppId: null, igdbId: null, steamStatus: "exact", igdbStatus: "skipped_no_credentials" }
  }
];

export const DUMMY_GAMES_B = [
  ...DUMMY_GAMES_A,
  {
    id: "demo_b_hogwarts_5",
    title: "Hogwarts Legacy",
    rawTitle: "Hogwarts Legacy",
    store: "Epic Games Store",
    classification: "game",
    cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg",
    background: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/page_bg_generated_v6b.jpg",
    screenshots: [],
    developer: "Avalanche Software",
    publisher: "Warner Bros. Games",
    franchise: "Harry Potter",
    releaseDate: "Feb 10, 2023",
    genres: ["Action", "RPG", "Adventure"],
    themes: [],
    tags: ["Open World", "Magic", "Fantasy"],
    platforms: ["windows"],
    summary: "Hogwarts Legacy is an immersive, open-world action RPG set in the world first introduced in the Harry Potter books.",
    about: null,
    ratings: { metacritic: 84, steam: 91, steamReviewCount: 185000, igdbCritic: 83, igdbUser: 85, opencritic: null },
    pricing: { currency: "USD", msrp: 59.99, current: 59.99, discountPercent: null, historicalLowest: 29.99 },
    isFree: false,
    features: { achievements: true },
    steamDeck: null,
    ownership: { purchaseDate: "May 2, 2023", purchasePrice: 59.99, marketplace: "Epic Games Store", transactionId: "DEMO_ORD_B05", playtimeSeconds: 54000, playtimeRaw: "15" },
    provenance: { confidence: "High", sources: ["Epic Games Account Export", "Receipt email"], issues: [], steamAppId: 990080, igdbId: null, steamStatus: "exact", igdbStatus: "skipped_no_credentials" }
  },
  {
    id: "demo_b_ghostrunner_6",
    title: "Ghostrunner",
    rawTitle: "Ghostrunner",
    store: "Epic Games Store",
    classification: "game",
    cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1139900/header.jpg",
    background: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1139900/page_bg_generated_v6b.jpg",
    screenshots: [],
    developer: "One More Level, 3D Realms",
    publisher: "505 Games",
    franchise: null,
    releaseDate: "Oct 27, 2020",
    genres: ["Action", "Cyberpunk", "Fast-Paced"],
    themes: [],
    tags: ["First-Person", "Ninja", "Hardcore"],
    platforms: ["windows"],
    summary: "Ghostrunner offers a unique single-player experience: fast-paced, violent combat, and an original setting that blends science fiction with post-apocalyptic themes.",
    about: null,
    ratings: { metacritic: 81, steam: 92, steamReviewCount: 41000, igdbCritic: 82, igdbUser: 84, opencritic: null },
    pricing: { currency: "USD", msrp: 29.99, current: 29.99, discountPercent: null, historicalLowest: 8.99 },
    isFree: false,
    features: { achievements: true },
    steamDeck: null,
    ownership: { purchaseDate: "Apr 13, 2023", purchasePrice: 0.00, marketplace: "Epic Games Store", transactionId: "DEMO_ORD_B06", playtimeSeconds: 14400, playtimeRaw: "4" },
    provenance: { confidence: "High", sources: ["Epic Games Account Export"], issues: [], steamAppId: 1139900, igdbId: null, steamStatus: "exact", igdbStatus: "skipped_no_credentials" }
  },
  {
    id: "demo_b_cities_skylines_7",
    title: "Cities: Skylines",
    rawTitle: "Cities: Skylines",
    store: "Epic Games Store",
    classification: "game",
    cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/255710/header.jpg",
    background: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/255710/page_bg_generated_v6b.jpg",
    screenshots: [],
    developer: "Colossal Order Ltd.",
    publisher: "Paradox Interactive",
    franchise: "Cities",
    releaseDate: "Mar 10, 2015",
    genres: ["Simulation", "Strategy", "City Builder"],
    themes: [],
    tags: ["Management", "Building", "Sandbox"],
    platforms: ["windows", "mac", "linux"],
    summary: "Cities: Skylines is a modern take on the classic city simulation.",
    about: null,
    ratings: { metacritic: 85, steam: 93, steamReviewCount: 195000, igdbCritic: 86, igdbUser: 88, opencritic: null },
    pricing: { currency: "USD", msrp: 29.99, current: 29.99, discountPercent: null, historicalLowest: 5.99 },
    isFree: false,
    features: { achievements: true },
    steamDeck: null,
    ownership: { purchaseDate: "Mar 17, 2022", purchasePrice: 0.00, marketplace: "Epic Games Store", transactionId: "DEMO_ORD_B07", playtimeSeconds: 72000, playtimeRaw: "20" },
    provenance: { confidence: "High", sources: ["Epic Games Account Export"], issues: [], steamAppId: 255710, igdbId: null, steamStatus: "exact", igdbStatus: "skipped_no_credentials" }
  },
  {
    id: "demo_b_circus_electrique_8",
    title: "Circus Electrique",
    rawTitle: "Circus Electrique",
    store: "Epic Games Store",
    classification: "game",
    cover: "assets/placeholders/cover.svg",
    background: "assets/placeholders/background.svg",
    screenshots: [],
    developer: "Zen Studios",
    publisher: "Saber Interactive",
    franchise: null,
    releaseDate: "Sep 6, 2022",
    genres: ["RPG", "Strategy", "Turn-Based"],
    themes: [],
    tags: ["Steampunk", "Tactical", "Dark Fantasy"],
    platforms: ["windows"],
    summary: "Circus Electrique is part story-driven RPG, part tactics, part circus management.",
    about: null,
    ratings: { metacritic: 73, steam: 74, steamReviewCount: 450, igdbCritic: 74, igdbUser: 76, opencritic: null },
    pricing: { currency: "USD", msrp: 19.99, current: 19.99, discountPercent: null, historicalLowest: 4.99 },
    isFree: false,
    features: { achievements: true },
    steamDeck: null,
    ownership: { purchaseDate: "May 15, 2024", purchasePrice: 0.00, marketplace: "Epic Games Store", transactionId: "DEMO_ORD_B08", playtimeSeconds: 0, playtimeRaw: "0" },
    provenance: { confidence: "High", sources: ["Epic Games Account Export"], issues: [], steamAppId: null, igdbId: null, steamStatus: "exact", igdbStatus: "skipped_no_credentials" }
  }
];

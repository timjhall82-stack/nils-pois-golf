// UPDATE THIS LINE
export const APP_VERSION = "v3.9.5 (03 Feb 2026 13:47)";

export const CUSTOM_LOGO_URL = "/NilsPoisGolfInAppLogo.png"; 
export const APP_ID = "nils-pois-golf-v5"; 
export const COLLECTION_NAME = 'golf_scores';
export const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop";

export const DEFAULT_PARS = [4, 4, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 4, 3, 4, 4, 5];
export const DEFAULT_SI = [5, 3, 17, 11, 7, 9, 1, 15, 13, 4, 10, 16, 18, 2, 12, 6, 14, 8]; 

export const PRESET_COURSES = {
  'olton_white': {
    name: "Olton GC (White)",
    slope: 135,
    rating: 71.5,
    pars: [4, 4, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 4, 3, 4, 4, 5], 
    si:   [5, 3, 17, 11, 7, 9, 1, 15, 13, 4, 10, 16, 18, 2, 12, 6, 14, 8]
  },
  'olton_yellow': {
    name: "Olton GC (Yellow)",
    slope: 132,
    rating: 70.0,
    pars: [4, 4, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 4, 3, 4, 4, 5], 
    si:   [5, 3, 17, 11, 7, 9, 1, 15, 13, 4, 10, 16, 18, 2, 12, 6, 14, 8]
  },
  'olton_red': {
    name: "Olton GC (Red)",
    slope: 136,
    rating: 73.7,
    pars: [5, 4, 4, 4, 3, 4, 5, 3, 4, 4, 5, 4, 3, 5, 3, 4, 4, 5], 
    si:   [11, 3, 13, 1, 15, 9, 5, 17, 7, 4, 14, 12, 18, 6, 10]
  },
  'fairhaven_blue': {
    name: "Fairhaven GC (Blue)",
    slope: 138,
    rating: 74.4,
    pars: [5, 3, 5, 4, 3, 4, 4, 4, 4, 3, 4, 4, 4, 4, 5, 4, 3, 5],
    si:   [5, 13, 11, 1, 17, 7, 15, 3, 9, 6, 16, 8, 10, 4, 14, 2, 18, 12]
  },
  'fairhaven_white': {
    name: "Fairhaven GC (White)",
    slope: 135,
    rating: 73.6,
    pars: [5, 3, 5, 4, 3, 4, 4, 4, 4, 3, 5, 4, 4, 4, 5, 4, 3, 5],
    si:   [5, 13, 11, 1, 17, 7, 15, 3, 9, 6, 16, 8, 10, 4, 14, 2, 18, 12]
  },
  'fairhaven_yellow': {
    name: "Fairhaven GC (Yellow)",
    slope: 130,
    rating: 71.6,
    pars: [5, 3, 4, 4, 3, 4, 4, 4, 4, 3, 5, 4, 4, 4, 5, 4, 3, 5],
    si:   [7, 13, 1, 3, 17, 9, 15, 5, 11, 6, 16, 8, 10, 4, 14, 2, 18, 12]
  },
  'fairhaven_red': {
    name: "Fairhaven GC (Red - Ladies)",
    slope: 136,
    rating: 75.8,
    pars: [5, 3, 5, 5, 3, 4, 4, 4, 4, 3, 5, 4, 4, 4, 5, 5, 3, 5],
    si:   [10, 18, 6, 12, 14, 2, 16, 4, 8, 11, 3, 17, 5, 15, 1, 7, 13, 9]
  },
  'moorpark_high_white': {
    name: "Moor Park - High (White)",
    slope: 139,
    rating: 73.3,
    pars: [4, 4, 3, 4, 4, 5, 4, 4, 5, 3, 4, 3, 5, 4, 4, 5, 4, 3],
    si:   [7, 3, 15, 5, 9, 11, 13, 1, 17, 18, 8, 4, 12, 2, 6, 16, 10, 14]
  },
  'moorpark_high_yellow': {
    name: "Moor Park - High (Yellow)",
    slope: 138,
    rating: 71.9,
    pars: [4, 4, 3, 4, 4, 5, 4, 4, 5, 3, 4, 3, 5, 4, 4, 5, 4, 3],
    si:   [7, 3, 15, 5, 9, 11, 13, 1, 17, 18, 8, 4, 12, 2, 6, 16, 10, 14]
  },
  'moorpark_high_red': {
    name: "Moor Park - High (Red)",
    slope: 136,
    rating: 74.4,
    pars: [4, 5, 3, 5, 4, 5, 4, 4, 4, 3, 4, 3, 5, 4, 4, 5, 4, 3],
    si:   [9, 11, 17, 5, 13, 3, 15, 1, 7, 16, 4, 10, 14, 2, 8, 12, 6, 18]
  },
  'moorpark_west_white': {
    name: "Moor Park - West (White)",
    slope: 121,
    rating: 68.8, 
    pars: [4, 3, 4, 3, 4, 3, 4, 4, 3, 4, 4, 5, 3, 5, 4, 4, 4, 4],
    si:   [11, 9, 5, 15, 3, 17, 1, 7, 13, 14, 6, 12, 16, 4, 2, 8, 10, 18]
  },
  'moorpark_west_yellow': {
    name: "Moor Park - West (Yellow)",
    slope: 116,
    rating: 67.7,
    pars: [4, 3, 4, 3, 4, 3, 4, 4, 3, 4, 4, 5, 3, 5, 4, 4, 4, 4],
    si:   [11, 9, 5, 15, 3, 17, 1, 7, 13, 14, 6, 12, 16, 4, 2, 8, 10, 18]
  },
  'moorpark_west_red': {
    name: "Moor Park - West (Red)",
    slope: 120,
    rating: 70.2,
    pars: [4, 3, 4, 3, 5, 3, 5, 4, 3, 3, 4, 5, 3, 5, 4, 4, 4, 4],
    si:   [11, 13, 3, 15, 7, 17, 5, 1, 9, 4, 10, 12, 16, 8, 2, 6, 14, 18]
  },
  'belfry_brabazon': {
    name: "The Belfry (Brabazon)",
    slope: 144,
    rating: 72.0,
    pars: [4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 3, 4, 5, 5, 4, 3, 4, 5],
    si:   [7, 5, 17, 3, 1, 11, 13, 9, 15, 8, 18, 6, 14, 2, 12, 16, 10, 4]
  },
  'royal_birkdale': {
    name: "Royal Birkdale (Champ)",
    slope: 138,
    rating: 74.4,
    pars: [4, 4, 4, 3, 4, 5, 3, 4, 4, 4, 4, 3, 4, 3, 5, 4, 5, 5],
    si:   [11, 3, 7, 15, 13, 1, 17, 9, 5, 12, 6, 14, 2, 16, 8, 18, 4, 10]
  },
  'st_andrews_old': {
    name: "St Andrews (Old Course)",
    slope: 129,
    rating: 71.4,
    pars: [4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 4, 4, 4],
    si:   [10, 6, 16, 8, 2, 12, 4, 14, 18, 15, 7, 3, 11, 1, 9, 13, 5, 17]
  },
  'wentworth_west': {
    name: "Wentworth (West)",
    slope: 153,
    rating: 77.5,
    pars: [4, 3, 4, 5, 3, 4, 4, 4, 4, 3, 4, 5, 4, 3, 4, 4, 5, 5],
    si:   [9, 15, 3, 1, 17, 11, 7, 5, 13, 18, 12, 2, 8, 16, 4, 14, 6, 10]
  },
  'sunningdale_old': {
    name: "Sunningdale (Old)",
    slope: 139,
    rating: 72.7,
    pars: [5, 4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 4, 3, 5, 3, 4, 4, 4],
    si:   [8, 4, 12, 16, 2, 10, 6, 18, 14, 7, 15, 1, 17, 5, 11, 3, 13, 9]
  },
  'valedolobo_ocean_white': {
    name: "Vale do Lobo Ocean (White)",
    slope: 140,
    rating: 74.1,
    pars: [4, 4, 5, 4, 3, 5, 3, 5, 4, 5, 4, 4, 3, 4, 3, 5, 3, 5],
    si:   [5, 13, 1, 7, 17, 9, 15, 11, 3, 10, 2, 6, 18, 8, 12, 4, 16, 14]
  },
  'valedolobo_ocean_yellow': {
    name: "Vale do Lobo Ocean (Yellow)",
    slope: 135,
    rating: 71.5,
    pars: [4, 4, 5, 4, 3, 5, 3, 5, 4, 5, 4, 4, 3, 4, 3, 5, 3, 5],
    si:   [5, 13, 1, 7, 17, 9, 15, 11, 3, 10, 2, 6, 18, 8, 12, 4, 16, 14]
  },
  'valedolobo_ocean_red': {
    name: "Vale do Lobo Ocean (Red - Ladies)",
    slope: 129,
    rating: 68.6,
    pars: [4, 4, 5, 4, 3, 5, 3, 5, 4, 5, 4, 4, 3, 4, 3, 5, 3, 5],
    si:   [5, 13, 1, 7, 17, 9, 15, 11, 3, 10, 2, 6, 18, 8, 12, 4, 16, 14]
  },
  'ombria_white': {
    name: "Ombria (White)",
    slope: 132,
    rating: 71.0,
    pars: [5, 5, 4, 3, 3, 5, 3, 4, 4, 4, 3, 5, 3, 4, 4, 5, 3, 4],
    si:   [5, 3, 17, 13, 15, 7, 9, 11, 1, 4, 8, 2, 14, 16, 6, 10, 12, 18]
  },
  'ombria_yellow': {
    name: "Ombria (Yellow)",
    slope: 127,
    rating: 68.6,
    pars: [5, 5, 4, 3, 3, 5, 3, 4, 4, 4, 3, 5, 3, 4, 4, 5, 3, 4],
    si:   [5, 3, 17, 13, 15, 7, 9, 11, 1, 4, 8, 2, 14, 16, 6, 10, 12, 18]
  },
  'ombria_red': {
    name: "Ombria (Red - Ladies)",
    slope: 125,
    rating: 69.1,
    pars: [5, 5, 4, 3, 3, 5, 3, 4, 4, 4, 3, 5, 3, 4, 4, 5, 3, 4],
    si:   [5, 3, 17, 13, 15, 7, 9, 11, 1, 4, 8, 2, 14, 16, 6, 10, 12, 18]
  },
  'laranjal_white': {
    name: "QDL Laranjal (White)",
    slope: 136,
    rating: 74.3,
    pars: [4, 3, 4, 4, 4, 3, 5, 3, 5, 4, 4, 3, 5, 4, 5, 3, 4, 5],
    si:   [15, 11, 5, 9, 3, 17, 1, 13, 7, 6, 18, 10, 16, 4, 8, 2, 14, 12]
  },
  'laranjal_gold': {
    name: "QDL Laranjal (Gold/Yellow)",
    slope: 130,
    rating: 71.1,
    pars: [4, 3, 4, 4, 4, 3, 5, 3, 5, 4, 4, 3, 5, 4, 5, 3, 4, 5],
    si:   [15, 11, 5, 9, 3, 17, 1, 13, 7, 6, 18, 10, 16, 4, 8, 2, 14, 12]
  },
  'laranjal_silver': {
    name: "QDL Laranjal (Silver/Red)",
    slope: 128,
    rating: 72.4,
    pars: [4, 3, 4, 4, 4, 3, 5, 3, 5, 4, 4, 3, 5, 4, 5, 3, 4, 5],
    si:   [15, 11, 5, 9, 3, 17, 1, 13, 7, 6, 18, 10, 16, 4, 8, 2, 14, 12]
  },
  'monterei_north_tournament': {
    name: "Monte Rei North (Tournament/Black)",
    slope: 147,
    rating: 75.6,
    pars: [4, 5, 4, 4, 3, 5, 3, 5, 3, 4, 3, 4, 4, 3, 4, 5, 4, 5],
    si:   [10, 6, 2, 14, 16, 4, 8, 12, 18, 5, 11, 7, 9, 17, 1, 13, 3, 15]
  },
  'monterei_north_championship': {
    name: "Monte Rei North (Champ/Gold)",
    slope: 142,
    rating: 72.9,
    pars: [4, 5, 4, 4, 3, 5, 3, 5, 3, 4, 3, 4, 4, 3, 4, 5, 4, 5],
    si:   [10, 6, 2, 14, 16, 4, 8, 12, 18, 5, 11, 7, 9, 17, 1, 13, 3, 15]
  },
  'monterei_north_forward': {
    name: "Monte Rei North (Silver/Ladies)",
    slope: 138,
    rating: 71.3,
    pars: [4, 5, 4, 4, 3, 5, 3, 5, 3, 4, 3, 4, 4, 3, 4, 5, 4, 5],
    si:   [10, 6, 2, 14, 16, 4, 8, 12, 18, 5, 11, 7, 9, 17, 1, 13, 3, 15]
  }
};
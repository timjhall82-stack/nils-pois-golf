export const APP_VERSION = "v3.9.1 Jan 20th 2026 19:07";
export const CUSTOM_LOGO_URL = "/NilsPoisGolfInAppLogo.png"; 
export const APP_ID = "nils-pois-golf-v5"; 
export const COLLECTION_NAME = 'golf_scores';
export const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop";

export const DEFAULT_PARS = [4, 4, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 4, 3, 4, 4, 5];
export const DEFAULT_SI = [5, 3, 17, 11, 7, 9, 1, 15, 13, 4, 10, 16, 18, 2, 12, 6, 14, 8]; 

export const PRESET_COURSES = {
  // --- OLTON GOLF CLUB ---
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

  // --- MOOR PARK: HIGH COURSE ---
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

  // --- MOOR PARK: WEST COURSE ---
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

// --- FAIRHAVEN GOLF CLUB ---
  'fairhaven_blue': {
    name: "Fairhaven GC (Blue)",
    slope: 138,
    rating: 74.4,
    // Note: Blue Hole 11 is Par 4
    pars: [5, 3, 5, 4, 3, 4, 4, 4, 4, 3, 4, 4, 4, 4, 5, 4, 3, 5],
    si:   [5, 13, 11, 1, 17, 7, 15, 3, 9, 6, 16, 8, 10, 4, 14, 2, 18, 12]
  },
  'fairhaven_white': {
    name: "Fairhaven GC (White)",
    slope: 135,
    rating: 73.6,
    // Note: White Hole 11 is Par 5
    pars: [5, 3, 5, 4, 3, 4, 4, 4, 4, 3, 5, 4, 4, 4, 5, 4, 3, 5],
    si:   [5, 13, 11, 1, 17, 7, 15, 3, 9, 6, 16, 8, 10, 4, 14, 2, 18, 12]
  },
  'fairhaven_yellow': {
    name: "Fairhaven GC (Yellow)",
    slope: 130,
    rating: 71.6,
    // Note: Yellow Hole 3 is Par 4
    pars: [5, 3, 4, 4, 3, 4, 4, 4, 4, 3, 5, 4, 4, 4, 5, 4, 3, 5],
    si:   [7, 13, 1, 3, 17, 9, 15, 5, 11, 6, 16, 8, 10, 4, 14, 2, 18, 12]
  },

// --- VALE DO LOBO: OCEAN COURSE ---
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

// --- OMBRIA GOLF COURSE ---
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

// --- QUINTA DO LAGO: LARANJAL ---
  'laranjal_white': {
    name: "QDL Laranjal (White)",
    slope: 136,
    rating: 74.3,
    // Front 35, Back 37 = Par 72
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

// --- MONTE REI: NORTH COURSE ---
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
  }
  // ... Add other courses here
};
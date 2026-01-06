export const CATEGORY_MAP: Record<string, string> = {
  "Study Groups": "Academics & Notes",
  "Coding & Tech": "Tech & AI",
  "Trading & Finance": "Trading & Finance",
  "General Chat & Chill": "Chat & Chill",
  "Events & Fests": "Events & Hackathons",
  "Hostel Life": "Flats & Housing",
  "Clubs & Societies": "Campus Updates",
  "Buy & Sell": "Buy & Sell",
};

export const DISPLAY_CATEGORIES = [
  "Academics & Notes",
  "Tech & AI",
  "Trading & Finance",
  "Chat & Chill",
  "Events & Hackathons",
  "Flats & Housing",
  "Campus Updates",
  "Buy & Sell",
  "Others"
];

/**
 * Maps a database category string to its display name.
 */
export function mapCategoryToDisplay(category: string): string {
  if (CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category];
  }
  
  // Check if it's already a display category (for new entries if any)
  if (DISPLAY_CATEGORIES.includes(category)) {
    return category;
  }

  return "Others";
}

/**
 * Maps a display category back to the list of database categories it represents.
 * Useful for filtering.
 */
export function mapDisplayToDbCategories(displayCategory: string): string[] {
  const dbCategories = Object.entries(CATEGORY_MAP)
    .filter(([_, display]) => display === displayCategory)
    .map(([db, _]) => db);

  if (displayCategory === "Others") {
    // Return all categories that are NOT in the mapping
    // This is a bit tricky without knowing all possible DB categories,
    // but we can handle it in the filtering logic by checking what's left.
    return []; 
  }

  return dbCategories.length > 0 ? dbCategories : [displayCategory];
}

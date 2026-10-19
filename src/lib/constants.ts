export const CATEGORIES = [
  { id: "technology", label: "Technology", newsApi: "technology", genres: "878" }, // Sci-Fi
  { id: "sports", label: "Sports", newsApi: "sports", genres: "18|28" }, // Drama | Action
  { id: "finance", label: "Finance", newsApi: "business", genres: "18|80" }, // Drama | Crime
  { id: "entertainment", label: "Entertainment", newsApi: "entertainment", genres: "35|10749|10402" }, // Comedy | Romance | Music
  { id: "health", label: "Health", newsApi: "health", genres: "99" }, // Documentary
  { id: "science", label: "Science", newsApi: "science", genres: "878|99" }, // Sci-Fi | Documentary
] as const;

export type Category = (typeof CATEGORIES)[number]["id"];
export const CARD_GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";
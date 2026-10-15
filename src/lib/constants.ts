export const CATEGORIES = [
  { id: "technology", label: "Technology", newsApi: "technology" },
  { id: "sports", label: "Sports", newsApi: "sports" },
  { id: "finance", label: "Finance", newsApi: "business" }, // NewsAPI has no "finance"
  { id: "entertainment", label: "Entertainment", newsApi: "entertainment" },
  { id: "health", label: "Health", newsApi: "health" },
  { id: "science", label: "Science", newsApi: "science" },
] as const;

export type Category = (typeof CATEGORIES)[number]["id"];
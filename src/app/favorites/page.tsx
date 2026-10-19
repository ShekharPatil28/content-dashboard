import FavoritesList from "@/components/feed/FavoritesList";
export const instant = false;
export default function FavoritesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Favorites</h1>
      <FavoritesList />
    </div>
  );
}
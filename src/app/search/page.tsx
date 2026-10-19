import SearchResults from "@/components/feed/SearchResults";
export const instant = false;
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Search</h1>
      <SearchResults query={(q ?? "").trim()} />
    </div>
  );
}
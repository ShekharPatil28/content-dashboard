import CategoryPicker from "@/components/settings/CategoryPicker";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <CategoryPicker />
    </div>
  );
}
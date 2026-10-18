// Pulls a readable message out of an RTK Query error
export function getErrorMessage(error: unknown): string {
  const e = error as { data?: { error?: string }; error?: string } | undefined;
  return e?.data?.error ?? e?.error ?? "Something went wrong. Please try again.";
}
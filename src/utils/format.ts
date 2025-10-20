export function prettyObject(msg: unknown) {
  if (typeof msg !== "string") {
    msg = JSON.stringify(msg, null, "  ");
  }

  if (msg === "{}") {
    return msg;
  }

  if (typeof msg === "string" && msg.startsWith("```json")) {
    return msg;
  }
  return ["```json", msg, "```"].join("\n");
}

export function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = (bytes / Math.pow(1024, i)).toFixed(2);
  return `${formattedSize} ${sizes[i]}`;
}

export function formatCredits(credits: number): string {
  if (credits >= 1_000_000_000) {
    return `${(credits / 1_000_000_000).toFixed(2)}B`;
  }
  if (credits >= 1_000_000) {
    return `${(credits / 1_000_000).toFixed(2)}M`;
  }
  if (credits >= 1_000) {
    return `${(credits / 1_000).toFixed(2)}K`;
  }
  return credits.toLocaleString();
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";

  const d = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(d.getTime())) return "Invalid Date";

  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

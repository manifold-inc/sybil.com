export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy"); // @TODO
    document.body.removeChild(textArea);
  }
}

export function formatNumber(value: number, long?: boolean): string {
  if (value >= 1e12) {
    const formatted = (value / 1e12).toFixed(1);
    return formatted.endsWith(".0")
      ? formatted.slice(0, -2) + "T"
      : formatted + "T";
  }
  if (value >= 1e9) {
    const formatted = (value / 1e9).toFixed(1);
    return formatted.endsWith(".0")
      ? formatted.slice(0, -2) + "B"
      : formatted + "B";
  }
  if (value >= 1e6) {
    const formatted = (value / 1e6).toFixed(1);
    return formatted.endsWith(".0")
      ? formatted.slice(0, -2) + "M"
      : formatted + "M";
  }
  if (value >= 1e3) {
    if (long) {
      return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    const formatted = (value / 1e3).toFixed(1);
    return formatted.endsWith(".0")
      ? formatted.slice(0, -2) + "K"
      : formatted + "K";
  }
  if (value < 1 && value !== 0) {
    // For very small numbers, show more precision
    if (value < 0.01) {
      const formatted = value.toFixed(3);
      return formatted.replace(/\.?0+$/, "");
    }
    const formatted = value.toFixed(2);
    return formatted.replace(/\.?0+$/, "");
  }
  const formatted = value.toFixed(2);
  const result = formatted.replace(/\.?0+$/, "");
  return result;
}

export function generateCompleteTimeRange(
  range: string
): { date: string; value: number }[] {
  const result: { date: string; value: number }[] = [];
  const now = new Date();
  const currentHour = now.getHours();

  switch (range) {
    case "day":
      for (let i = 0; i < 24; i++) {
        const hour = (currentHour - i + 24) % 24;
        const displayStr = `${hour.toString().padStart(2, "0")}00`;
        result.unshift({
          date: displayStr,
          value: 0,
        });
      }
      break;
    case "week":
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const displayStr = `${date.getMonth() + 1}/${date.getDate()}`;
        result.push({
          date: displayStr,
          value: 0,
        });
      }
      break;
    case "2month":
      for (let i = 59; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const displayStr = `${date.getMonth() + 1}/${date.getDate() + 1}`;
        result.push({
          date: displayStr,
          value: 0,
        });
      }
      break;
    case "year": {
      const year = now.getFullYear();
      for (let month = 0; month < 12; month++) {
        const displayStr = `${year}-${(month + 1).toString().padStart(2, "0")}`;
        result.push({
          date: displayStr,
          value: 0,
        });
      }
      break;
    }
    default:
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const displayStr = `${date.getMonth() + 1}/${date.getDate() + 1}`;
        result.push({
          date: displayStr,
          value: 0,
        });
      }
      break;
  }
  return result;
}

export function formatDateForRange(dateStr: string, range: string): string {
  const utcDate = new Date(dateStr);

  switch (range) {
    case "day":
      return `${utcDate.getHours().toString().padStart(2, "0")}00`;
    case "week":
    case "month":
    case "2month":
      return `${utcDate.getMonth() + 1}/${utcDate.getDate() + 1}`;
    default:
      return dateStr;
  }
}

export function transformToChartData<
  T extends {
    date: string;
    model: string;
    value?: number;
    total?: number;
    count?: number;
  },
>(
  data: T[],
  range: "day" | "week" | "month" | "2month" | "year",
  valueKey: keyof T = "value"
): { date: string; model: string; value: number }[] {
  const completeRange = generateCompleteTimeRange(range);
  const models = Array.from(new Set(data.map((item) => item.model)));
  const dataMap = new Map<string, number>();

  data.forEach((item) => {
    const dateKey = formatDateForRange(item.date, range);
    dataMap.set(`${item.model}__${dateKey}`, Number(item[valueKey]));
  });

  const result: { date: string; model: string; value: number }[] = [];
  for (const model of models) {
    for (const point of completeRange) {
      result.push({
        date: point.date,
        model,
        value: dataMap.get(`${model}__${point.date}`) || 0,
      });
    }
  }
  return result;
}

export function getModelLogo(
  modelName: string,
  darkMode: boolean = true
): string {
  const modelLower = modelName.toLowerCase().split("/")[0];

  if (modelLower === "deepseek-ai")
    return darkMode ? "models/deepseek-dark.svg" : "models/deepseek.svg";
  if (modelLower === "hone")
    return darkMode ? "models/hone-dark.svg" : "models/hone.svg";
  if (modelLower === "moonshot")
    return darkMode ? "models/moonshot-dark.svg" : "models/moonshot.svg";
  if (modelLower === "openai")
    return darkMode ? "models/openai-dark.svg" : "models/openai.svg";
  if (modelLower === "qwen")
    return darkMode ? "models/qwen-dark.svg" : "models/qwen.svg";
  if (modelLower === "zai-org")
    return darkMode ? "models/zai-dark.svg" : "models/zai.svg";
  if (modelLower === "mistralai")
    return darkMode ? "models/mistralai-dark.svg" : "models/mistralai.svg";

  return darkMode ? "sybil-dark.svg" : "sybil.svg"; // default fallback
}

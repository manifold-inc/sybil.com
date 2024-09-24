export function createLogger(options: { prefix?: string }) {
  return {
    log(...args: unknown[]) {
      console.log(options.prefix ?? "", ...args);
    },
    error(...args: unknown[]) {
      console.error(options.prefix ?? "", ...args);
    },
    info(...args: unknown[]) {
      console.info(options.prefix ?? "", ...args);
    },
    warn(...args: unknown[]) {
      console.warn(options.prefix ?? "", ...args);
    },
  };
}

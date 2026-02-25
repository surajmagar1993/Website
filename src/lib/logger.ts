// Client-side compatible logger (console wrapper)
export const logger = {
  info: (msg: string, ...args: unknown[]) => console.log(msg, ...args),
  error: (msg: string, ...args: unknown[]) => console.error(msg, ...args),
  warn: (msg: string, ...args: unknown[]) => console.warn(msg, ...args),
};

// Simple logger implementation
export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta || '');
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta || '');
  },
  error: (message: string, meta?: unknown) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, meta || '');
  },
  debug: (message: string, meta?: unknown) => {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, meta || '');
  },
};

// Stream interface for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
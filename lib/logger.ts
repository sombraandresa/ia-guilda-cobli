import winston from "winston";

const SERVICE = process.env.SERVICE_NAME ?? "ia-guilda-cobli";
const VERSION = process.env.SERVICE_VERSION ?? process.env.npm_package_version ?? "0.0.0";

const cobliFormat = winston.format((info) => {
  const { level, message, timestamp, stack, ...rest } = info;
  return {
    ...info,
    timestamp: timestamp ?? new Date().toISOString(),
    level,
    message,
    dd: { service: SERVICE, version: VERSION, ...((rest as Record<string, unknown>).dd ?? {}) },
    custom: Object.fromEntries(
      Object.entries(rest).filter(([k]) => !["dd", "stack_trace"].includes(k))
    ),
    stack_trace: stack ?? (rest as Record<string, unknown>).stack_trace,
  };
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    cobliFormat(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console({ handleExceptions: true })],
});

export function safeLog(
  logger: CacheLogger | undefined,
  event: CacheLogEvent,
): void {
  if (!logger) {
    return
  }

  try {
    const loggerPromise = logger.log(event)
    if (loggerPromise && typeof loggerPromise.then === 'function') {
      void (loggerPromise).catch(() => {
        // Never let logging errors bubble into cache operations.
      })
    }
  }
  catch {
    // Swallow logging errors.
  }
}

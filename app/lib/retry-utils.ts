
// Retry utility with exponential backoff for handling timeout errors
export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: (string | number)[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [524, 504, 502, 503, 'timeout', 'ECONNRESET', 'ETIMEDOUT']
};

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = opts.retryableErrors.some(retryableError => {
        if (typeof retryableError === 'number') {
          return error.status === retryableError || error.code === retryableError;
        }
        return error.message?.toLowerCase().includes(retryableError.toLowerCase()) ||
               error.code?.toLowerCase().includes(retryableError.toLowerCase());
      });

      if (!isRetryable || attempt === opts.maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      console.log(`🔄 [RETRY] Attempt ${attempt}/${opts.maxAttempts} failed, retrying in ${delay}ms...`);
      console.log(`🔄 [RETRY] Error: ${error.message}`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function isTimeoutError(error: any): boolean {
  const timeoutIndicators = [
    'timeout',
    'ETIMEDOUT',
    'ECONNRESET',
    'socket hang up',
    'network timeout'
  ];

  return timeoutIndicators.some(indicator =>
    error.message?.toLowerCase().includes(indicator.toLowerCase()) ||
    error.code?.toLowerCase().includes(indicator.toLowerCase())
  ) || [524, 504, 502, 503].includes(error.status);
}

export function createTimeoutController(timeoutMs: number): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
  cleanup: () => void;
} {
  const controller = new AbortController();
  let isAborted = false;
  
  const timeoutId = setTimeout(() => {
    if (!isAborted) {
      console.log(`⏰ [TIMEOUT] Aborting operation after ${timeoutMs}ms`);
      isAborted = true;
      controller.abort();
    }
  }, timeoutMs);

  const cleanup = () => {
    if (!isAborted) {
      clearTimeout(timeoutId);
      isAborted = true;
    }
  };

  return { controller, timeoutId, cleanup };
}

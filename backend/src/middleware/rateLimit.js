/**
 * Rate limiting middleware to protect against brute force attacks
 * Limits requests based on IP address
 */

const requestCounts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Maximum requests per window
const WINDOW_LOG_INTERVAL = 5 * 60 * 1000; // Log interval: 5 minutes

// Clear request counts periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.windowStart > WINDOW_MS) {
      requestCounts.delete(ip);
    }
  }
}, WINDOW_MS);

// Log request counts periodically
setInterval(() => {
  console.log(`[Rate Limiter] Current tracking ${requestCounts.size} IPs`);
}, WINDOW_LOG_INTERVAL);

export const rateLimit = (req, res, next) => {
  // Get client IP
  const ip = req.ip || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             req.connection.socket.remoteAddress || 
             'unknown';

  const now = Date.now();
  
  // Initialize or update IP data
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, {
      count: 1,
      windowStart: now
    });
    return next();
  }
  
  const data = requestCounts.get(ip);
  
  // Reset window if needed
  if (now - data.windowStart > WINDOW_MS) {
    data.count = 1;
    data.windowStart = now;
    return next();
  }
  
  // Check if limit exceeded
  if (data.count >= MAX_REQUESTS) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please try again later.'
    });
  }
  
  // Increment count and continue
  data.count++;
  return next();
};

// Export a configurable version for different routes with custom limits
export const createRateLimiter = (windowMs = WINDOW_MS, maxRequests = MAX_REQUESTS) => {
  const routeRequestCounts = new Map();
  
  // Clear request counts for this specific limiter
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of routeRequestCounts.entries()) {
      if (now - data.windowStart > windowMs) {
        routeRequestCounts.delete(ip);
      }
    }
  }, windowMs);
  
  return (req, res, next) => {
    const ip = req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.connection.socket.remoteAddress || 
               'unknown';

    const now = Date.now();
    
    if (!routeRequestCounts.has(ip)) {
      routeRequestCounts.set(ip, {
        count: 1,
        windowStart: now
      });
      return next();
    }
    
    const data = routeRequestCounts.get(ip);
    
    if (now - data.windowStart > windowMs) {
      data.count = 1;
      data.windowStart = now;
      return next();
    }
    
    if (data.count >= maxRequests) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests. Please try again later.'
      });
    }
    
    data.count++;
    return next();
  };
}; 
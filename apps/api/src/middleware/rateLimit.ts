const buckets = new Map();
const getDefaultKey = (request) => request.ip || "unknown";
const pruneExpiredBuckets = (now) => {
    if (buckets.size < 500) {
        return;
    }
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) {
            buckets.delete(key);
        }
    }
};
export const createRateLimit = ({ windowMs, max, message, keyFn = getDefaultKey, }) => {
    return (request, response, next) => {
        const now = Date.now();
        pruneExpiredBuckets(now);
        const scopedKey = keyFn(request);
        const key = `${request.route?.path ?? request.path}:${scopedKey}`;
        const current = buckets.get(key);
        if (!current || current.resetAt <= now) {
            buckets.set(key, {
                count: 1,
                resetAt: now + windowMs,
            });
            response.setHeader("X-RateLimit-Limit", max.toString());
            response.setHeader("X-RateLimit-Remaining", Math.max(max - 1, 0).toString());
            response.setHeader("X-RateLimit-Reset", Math.ceil((now + windowMs) / 1000).toString());
            next();
            return;
        }
        current.count += 1;
        buckets.set(key, current);
        response.setHeader("X-RateLimit-Limit", max.toString());
        response.setHeader("X-RateLimit-Remaining", Math.max(max - current.count, 0).toString());
        response.setHeader("X-RateLimit-Reset", Math.ceil(current.resetAt / 1000).toString());
        if (current.count > max) {
            response.status(429).json({ message });
            return;
        }
        next();
    };
};

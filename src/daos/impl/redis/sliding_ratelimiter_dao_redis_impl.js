const redis = require('./redis_client');
/* eslint-disable no-unused-vars */
const keyGenerator = require('./redis_key_generator');
const timeUtils = require('../../../utils/time_utils');
/* eslint-enable */

/* eslint-disable no-unused-vars */

// Challenge 7
const hitSlidingWindow = async (name, opts) => {
  const client = redis.getClient();

  // START Challenge #7
  const key = keyGenerator.getRateLimiterKey(name, opts.interval, opts.maxHits);
  const currentTime = +new Date();
  const randomNumber = Math.random();
  const olderValues = currentTime - (opts.interval);

  const transaction = client.multi();

  transaction.zadd(key, currentTime, `${currentTime}-${randomNumber}`);
  transaction.zremrangebyscore(key, '-inf', olderValues);
  transaction.zcard(key);

  const [,, hits] = await transaction.execAsync();

  if (hits > opts.maxHits) {
    return -1;
  }

  return opts.maxHits - hits;
  // END Challenge #7
};

/* eslint-enable */

module.exports = {
  /**
   * Record a hit against a unique resource that is being
   * rate limited.  Will return 0 when the resource has hit
   * the rate limit.
   * @param {string} name - the unique name of the resource.
   * @param {Object} opts - object containing interval and maxHits details:
   *   {
   *     interval: 1,
   *     maxHits: 5
   *   }
   * @returns {Promise} - Promise that resolves to number of hits remaining,
   *   or 0 if the rate limit has been exceeded..
   */
  hit: hitSlidingWindow,
};

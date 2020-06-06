// Limit all subscriptions to 1/s
DDPRateLimiter.addRule({
  type: 'subscription',
}, 10, 10000);

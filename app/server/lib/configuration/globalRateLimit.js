const logRateLimit = _.debounce(function (ruleInput) {
  console.log(`Rate limit on ${ruleInput.name} by user ${ruleInput.userId} at IP ${ruleInput.clientAddress}`);
}, 500);

DDPRateLimiter.addRule({
  type: 'method',
  name(name) {
    return true;
  },
  // Rate limit per connection ID
  connectionId() { return true; }
}, 10, 1000, (reply, ruleInput) => {
  if (!reply.allowed) {
    logRateLimit(ruleInput);
  }
});

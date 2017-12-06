subsManager = new SubsManager({
	// maximum number of cache subscriptions
	cacheLimit: 5,
	// any subscription will be expire after 1 minute, if it's not subscribed again
	expireIn: 1,
});

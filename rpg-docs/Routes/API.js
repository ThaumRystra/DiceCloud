Router.map(function() {
	this.route("vmixCharacter", {
		path: "/vmix-character/:_id/",
		where: "server",
		action: function() {
			this.response.setHeader("Content-Type", "application/json");
			var query = this.params.query;
			var key = query && query.key;
			ifKeyValid(key, this.response, "vmixCharacter", () =>
				this.response.end(vMixCharacter(this.params._id))
			);
		},
	});
	this.route("vmixParty", {
		path: "/vmix-party/:_id/",
		where: "server",
		action: function() {
			this.response.setHeader("Content-Type", "application/json");
			var query = this.params.query;
			var key = query && query.key;
			ifKeyValid(key, this.response, "vmixParty", () =>
				this.response.end(vMixParty(this.params._id))
			);
		},
	});
	this.route("jsonCharacterSheet", {
		path: "/character/:_id/json",
		where: "server",
		action: function() {
			this.response.setHeader("Content-Type", "application/json");
			var query = this.params.query;
			var key = query && query.key;
			ifKeyValid(key, this.response, "jsonCharacterSheet", () =>
				this.response.end(JSONExport(this.params._id))
			);
		},
	});
});

var ifKeyValid = function(apiKey, response, method, callback){
	if (!apiKey){
		response.writeHead(403, "You must use an api key to access this api");
		response.end();
	} else if (!isKeyValid(apiKey)){
		response.writeHead(403, "API key is invalid");
		response.end();
	} else if (isRateLimited(apiKey)){
		response.writeHead(429, "Too many requests");
		response.end();
	} else {
		rateLimiter.increment({apiKey: apiKey, method: method})
		callback();
	}
};

var isKeyValid = function(apiKey){
	var user = Meteor.users.findOne({apiKey});
	if (!user) return false;
	var blackListed = Blacklist.findOne({userId: user._id});
	return !blackListed;
};

var rateLimiter = new RateLimiter();
rateLimiter.addRule({apiKey: String}, 5, 5000);
rateLimiter.addRule({apiKey: String, method: "vmixCharacter"}, 2, 10000);
rateLimiter.addRule({apiKey: String, method: "vmixParty"}, 2, 10000);
rateLimiter.addRule({apiKey: String, method: "jsonCharacterSheet"}, 5, 5000);

var isRateLimited = function(apiKey){
	const limited = !rateLimiter.check({apiKey}).allowed
	if (limited) {
		console.log(`Rate limit hit by API key ${apiKey}`);
		return true;
	} else {
		return false;
	}
};

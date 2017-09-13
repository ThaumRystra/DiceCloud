Router.map(function() {
	this.route("vmixCharacter", {
		path: "/vmix-character/:_id/",
		where: "server",
		action: function() {
			this.response.setHeader("Content-Type", "application/json");
			this.response.end(vMixCharacter(this.params._id));
		},
	});
	this.route("vmixParty", {
		path: "/vmix-party/:_id/",
		where: "server",
		action: function() {
			this.response.setHeader("Content-Type", "application/json");
			this.response.end(vMixParty(this.params._id));
		},
	});
});

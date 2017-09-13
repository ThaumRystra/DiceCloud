Router.map(function() {
	this.route("vmixAPI", {
		path: "/vmix-character/:_id/",
		where: "server",
		action: function() {
			this.response.setHeader("Content-Type", "application/json");
			this.response.end(vMixJson(this.params._id));
		},
	});
});

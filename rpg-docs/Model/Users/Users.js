Meteor.users.allow({
	update: function(userId, doc, fields, modifier) {
		if (
			doc._id === userId &&
			_.contains(fields, "username") &&
			_.contains(fields, "profile") &&
			fields.length === 2 &&
			_.keys(modifier).length === 1 &&
			modifier.$set &&
			modifier.$set["profile.username"] &&
			modifier.$set.username &&
			_.keys(modifier.$set).length === 2
		){
			var expectedUsername = modifier.$set["profile.username"];
			expectedUsername = expectedUsername.toLowerCase().replace(/\s+/gm, "");
			if (modifier.$set.username !== expectedUsername){
				return false;
			}
			var foundUser = Meteor.call("getUserId", expectedUsername);
			return !foundUser || foundUser === userId;
		}
	}
});

Meteor.methods({
	"getUserId": function (username) {
		if (!username) return;
		if (Meteor.isClient) return;
		const user = Meteor.users.findOne({ username }) ||
			Meteor.users.findOne({ 'emails.address': username });
		return user && user._id;
	}
});

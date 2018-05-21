Meteor.methods({
	"getUserId": function(username){
		if (!username) return;
		regex = new RegExp("^" + username + "$", "i")
		var user = Meteor.users.findOne(
			{$or: [
				{username: username},
				{"emails.address": regex},
				{"services.google.email": regex},
				]}
		);
		return user && user._id;
	}
});

Meteor.methods({
	"getUserId": function(username){
		if (!username) return;
		var user = Meteor.users.findOne(
			{$or: [{username: username}, {"emails.address": username}]}
		);
		return user && user._id;
	}
});

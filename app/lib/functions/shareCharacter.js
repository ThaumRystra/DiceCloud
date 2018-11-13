Meteor.methods({
	"getUserId": function(username){
		if (!username) return;
		if (Meteor.isClient) return;
		let user = Accounts.findUserByUsername(username) ||
			Accounts.findUserByEmail(username);
		return user && user._id;
	}
});

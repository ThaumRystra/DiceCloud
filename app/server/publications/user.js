Meteor.publish("user", function(){
	return Meteor.users.find(this.userId, {fields: {
		roles: 1,
		username: 1,
		profile: 1,
		apiKey: 1,
	}});
});

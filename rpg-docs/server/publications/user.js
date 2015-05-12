Meteor.publish("user", function(){
	return Meteor.users.find(this.userId, {fields: {roles: 1}});
});

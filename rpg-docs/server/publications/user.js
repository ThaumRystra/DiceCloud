Meteor.publish("user", function(){
	return Meteor.users.find(this.userId);
});

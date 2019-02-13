import '/imports/api/users/Users.js';

Meteor.publish("user", function(){
	return Meteor.users.find(this.userId, {fields: {
		roles: 1,
		username: 1,
		apiKey: 1,
		darkMode: 1,
	}});
});

Meteor.publish("userNames", function(ids){
	if (!this.userId || !ids) return [];
	return Meteor.users.find(
		{_id: {$in: ids}},
		{fields: {username: 1}}
	);
});

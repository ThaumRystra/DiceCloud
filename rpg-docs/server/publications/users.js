Meteor.publish("userNames", function(ids){
	if (!this.userId || !ids) return [];
	return Meteor.users.find(
		{_id: {$in: ids}},
		{fields: {username: 1}}
	);
});

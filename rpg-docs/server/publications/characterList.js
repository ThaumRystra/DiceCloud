Meteor.publish("characterList",function(userId){
	if(!userId) {
		this.ready();
		return;
	}
	return Characters.find({
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId}
		]
	});
});

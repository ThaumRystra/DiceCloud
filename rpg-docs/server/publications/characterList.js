Meteor.publish("characterList", function(){
	var userId = this.userId;
	if (!userId) {
		this.ready();
		return;
	}
	return Characters.find({
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
		]
	});
});

Meteor.publish("characterList", function(){
	var userId = this.userId;
	if (!userId) {
		this.ready();
		return;
	}
	return Characters.find(
		{
			$or: [
				{readers: userId},
				{writers: userId},
				{owner: userId},
			]
		},
		{
			fields: {
				name: 1,
				race: 1,
				alignment: 1,
				gender: 1,
				readers: 1,
				writers:1,
				owner: 1,
				color: 1,
				picture: 1,
			}
		}
	);
});

Meteor.publish("characterList",function(userId){
	if(!userId) return;
	return Characters.find({
		$or: [ 
			{readers: userId}, 
			{writers: userId}, 
			{owner: userId} 
		] 
	});
});

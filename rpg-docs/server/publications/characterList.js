Meteor.publish("characterList",function(userId){
	//TODO also return characters this user can view
	return Characters.find({owner: userId});
});
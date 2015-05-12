Meteor.publish("changeLog", function(){
	return ChangeLogs.find();
});

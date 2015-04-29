Template.shareDialog.onCreated(function(){
	this.userId = new ReactiveVar();
});

Template.shareDialog.helpers({
	readers: function(){
		var char = Characters.findOne(this._id, {fields: {readers: 1}});
		return Meteor.users.find({_id: {$in: char.readers}});
	},
	writers: function(){
		var char = Characters.findOne(this._id, {fields: {writers: 1}});
		return Meteor.users.find({_id: {$in: char.writers}});
	},
	shareButtonDisabled: function(){
		return !Template.instance().userId.get();
	},
	userFindError: function(){
		if (!Template.instance().userId.get()){
			return "User not found";
		}
	},
});

Template.shareDialog.events({
	"input #userNameOrEmailInput":
	function(event, instance){
		var userName = instance.find("#userNameOrEmailInput").value;
		instance.userId.set(undefined);
		Meteor.call("getUserId", userName, function(err, result) {
			if (err){
				console.error(err);
			} else {
				console.log(result);
				instance.userId.set(result);
			}
		});
	},
	"tap #shareButton": function(event, instance){
		var self = this;
		var permission = instance.find("#accessLevelMenu").selected;
		if (!permission) throw "no permission set";
		var userId = instance.userId.get();
		if (!userId) return;
		if (permission === "write"){
			Characters.update(self._id, {
				$addToSet: {writers: userId},
				$pull: {readers: userId},
			});
		} else {
			Characters.update(self._id, {
				$addToSet: {readers: userId},
				$pull: {writers: userId},
			});
		}
	},
});

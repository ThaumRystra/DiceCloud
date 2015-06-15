Template.shareDialog.onCreated(function(){
	this.userId = new ReactiveVar();
});

Template.shareDialog.helpers({
	viewPermission: function() {
		var char = Characters.findOne(this._id, {fields: {settings: 1}});
		return char.settings.viewPermission || "whitelist";
	},
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
	getUserName: function() {
		return this.username || "user: " + this._id;
	}
});

Template.shareDialog.events({
	"core-select .visibilityDropdown": function(event){
		var detail = event.originalEvent.detail;
		if (!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		var char = Characters.findOne(this._id, {fields: {settings: 1}});
		if (value == char.settings.viewPermission) return;
		Characters.update(this._id, {$set: {"settings.viewPermission": value}});
	},
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
	"tap .deleteShare": function(event, instance) {
		Characters.update(instance.data._id, {
			$pull: {writers: this._id, readers: this._id}
		});
	},
});

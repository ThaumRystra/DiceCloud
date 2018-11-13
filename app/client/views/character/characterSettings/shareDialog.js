Template.shareDialog.onCreated(function(){
	this.userId = new ReactiveVar();
	this.autorun(() => {
		var char = Characters.findOne(Template.currentData()._id, {
			fields: {readers: 1, writers: 1}
		});
		if (!char) return;
		this.subscribe("userNames", _.union(char.readers, char.writers));
	});
});

Template.shareDialog.onRendered(function(){
	// Polymer not mirroring selected attribute properly
	this.$("paper-listbox").each(function(){
		this.selected = this.getAttribute("selected");
	});
});

Template.shareDialog.helpers({
	viewPermission: function() {
		var char = Characters.findOne(this._id, {fields: {settings: 1}});
		return char.settings.viewPermission || "whitelist";
	},
	readers: function(){
		var char = Characters.findOne(this._id, {fields: {readers: 1}});
		return char.readers;
	},
	writers: function(){
		var char = Characters.findOne(this._id, {fields: {writers: 1}});
		//Meteor.users.find({_id: {$in: char.writers}});
		return char.writers
	},
	username: function(id){
		const user = Meteor.users.findOne(id);
		return user && user.username || "user: " + id;
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
	"iron-select .visibilityDropdown": function(event){
		var detail = event.originalEvent.detail;
		var value = detail.item.getAttribute("name");
		var char = Characters.findOne(this._id, {fields: {settings: 1}});
		if (value == char.settings.viewPermission) return;
		Characters.update(this._id, {$set: {"settings.viewPermission": value}});
	},
	"input #userNameOrEmailInput":
	_.debounce(function(event, instance){
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
	}, 300),
	"click #shareButton": function(event, instance){
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
	"click .deleteShare": function(event, instance) {
		Characters.update(instance.data._id, {
			$pull: {writers: this.id, readers: this.id}
		});
	},
	"click .doneButton": function(event, instance){
		popDialogStack();
	},
});

Template.customAttributeList.helpers({
	customAttributes: function() {
		return CustomAttributes.find({"charId": this.charId});
	},
});


Template.customAttributeList.events({
	"tap #addCustomAttributeButton": function(){
		CustomAttributes.insert({
			charId: this.charId,
			name: "customAttribute",
			displayName: "Custom Attribute",
		});
	},
});

const debounce = (f) => _.debounce(f, 300);

Template.customAttributeListItem.events({
	"click .deleteAttribute": function(event){
		CustomAttributes.softRemove(this.attr._id);
		GlobalUI.deletedToast(this.attr._id, "Custom Attributes", "Custom Attribute");
	},

	"input .displayNameInput, keypress .displayNameInput": debounce(function(event){
		const input = event.currentTarget;
		var newDisplayName = input.value;

		if (!newDisplayName){
			input.invalid = true;
			input.errorMessage = "Display name is required";
		} else if (CustomAttributes.findOne({"charId": this.charId, "displayName": newDisplayName})
				   && CustomAttributes.findOne({"charId": this.charId, "displayName": newDisplayName})._id != this.attr._id) {
			input.invalid = true;
			input.errorMessage = "Display name already in use";
		} else {
			input.invalid = false;
			if (newDisplayName == this.attr.displayName) return;
			CustomAttributes.update(this.attr._id, {$set: {"displayName": newDisplayName}});
		};
	}),

	"input .nameInput, keypress .nameInput": debounce(function(event){
		const input = event.currentTarget;
		var newName = input.value;

		if (!newName){
			input.invalid = true;
			input.errorMessage = "Name is required";
		} else if (newName.match(/\W/)) {
			input.invalid = true;
			input.errorMessage = "Invalid character: '"+ newName.match(/\W/)[0] + "'";
		} else if (CustomAttributes.findOne({"charId": this.charId, "name": newName})
				   && CustomAttributes.findOne({"charId": this.charId, "name": newName})._id != this.attr._id) {
			input.invalid = true;
			input.errorMessage = "Code name already in use";
		} else {
			input.invalid = false;
			if (newName == this.attr.name) return;
			CustomAttributes.update(this.attr._id, {$set: {"name":  newName.replace(/\W/g, "")}});
		};
	}),

	"iron-select .typeDropDown": function(event){
		var detail = event.originalEvent.detail;
		var value = Boolean(Number(detail.item.getAttribute("name"))); //ugly, but necessary to convert from strings ("1" and "0") to true and false
		if (value == this.attr.isResource) return;

		CustomAttributes.update(this.attr._id, {$set: {"isResource": value}});
	},
});
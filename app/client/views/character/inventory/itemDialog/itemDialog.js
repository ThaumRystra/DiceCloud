var getContainers = function (charId) {
	return Containers.find(
		{
			charId: charId,
			removed: { $ne: true },
		},
		{ sort: { name: 1, _id: 1 }, fields: { name: 1 } }
	);
};

Template.itemDialog.onCreated(function () {
	this.editing = new ReactiveVar(!!this.data.startEditing);
});

Template.itemDialog.helpers({
	item: function () {
		return Items.findOne(this.itemId);
	},
	editing: function () {
		return Template.instance().editing.get();
	},
	itemHeading: function () {
		if (this.quantity === 1) {
			return this.name;
		} else {
			var pName = this.plural || this.name;
			return this.quantity + " " + pName;
		}
	},
});

Template.itemDialog.events({
	"click #editButton": function (event, instance) {
		instance.editing.set(true);
	},
	"click #doneEditingButton": function (event, instance) {
		instance.editing.set(false);
	},
	"color-change": function (event, instance) {
		Items.update(instance.data.itemId, { $set: { color: event.color } });
	},
	"click #deleteButton": function (event, instance) {
		Items.softRemoveNode(instance.data.itemId);
		GlobalUI.deletedToast(instance.data.itemId, "Items", "Item");
		popDialogStack();
	},
});

Template.itemEdit.helpers({
	ne1: function (num) {
		return num != 1;
	},
});

const debounce = (f) => _.debounce(f, 200);

Template.itemEdit.events({
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"input #itemNameInput": debounce(function (event, instance) {
		const input = event.currentTarget;
		var name = input.value;
		if (!name) {
			input.invalid = true;
			input.errorMessage = "Name is required";
		} else {
			input.invalid = false;
			Items.update(this._id, {
				$set: { name: name }
			}, {
				removeEmptyStrings: false,
				trimStrings: false,
			});
		}
	}),
	"input #itemPluralInput": debounce(function (event, instance) {
		var plural = event.currentTarget.value;
		Items.update(this._id, {
			$set: { plural: plural }
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"input #quantityInput": debounce(function (event, instance) {
		var quantity = +event.currentTarget.value;
		Items.update(this._id, {
			$set: { quantity: quantity }
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"input #weightInput": debounce(function (event, instance) {
		var weight = +event.currentTarget.value;
		Items.update(this._id, {
			$set: { weight: weight }
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"input #valueInput": debounce(function (event, instance) {
		var value = +event.currentTarget.value;
		Items.update(this._id, {
			$set: { value: value }
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"input #itemDescriptionInput": debounce(function (event, instance) {
		var description = event.currentTarget.value;
		Items.update(this._id, {
			$set: { description: description }
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"change #equippedInput": function (event) {
		var equipped = event.currentTarget.checked;
		if (equipped) {
			Meteor.call("equipItem", this._id, this.charId);
		} else {
			Meteor.call("unequipItem", this._id, this.charId);
		}
	},
	"change #incrementCheckbox": function (event) {
		var value = event.currentTarget.checked;
		Items.update(this._id, { $set: { "settings.showIncrement": value } });
	},
	"change #attunementCheckbox": function (event) {
		var value = event.currentTarget.checked;
		Items.update(this._id, { $set: { requiresAttunement: value } });
	},
});

Template.containerDropdown.helpers({
	containers: function () {
		return getContainers(this.charId);
	}
});

Template.containerDropdown.events({
	"iron-select #containerDropDown": function (event) {
		var detail = event.originalEvent.detail;
		var containerId = detail.item.getAttribute("name");
		Meteor.call("moveItemToContainer", Template.currentData()._id, containerId);
	}
});

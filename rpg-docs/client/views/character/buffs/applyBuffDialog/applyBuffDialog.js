Template.applyBuffDialog.onCreated(function(){
	this.selectedTarget = new ReactiveVar("default");
});

Template.applyBuffDialog.helpers({
	cantApply: function() {
		return this.buff.target === "others" && Template.instance().selectedTarget.get() === "default"; //this is the only case where we can't apply a buff
	},
	canApplyToSelf: function() {
		return this.buff.target !== "others"; //i.e. it is "self" or "both"
	},
	writableCharacters: function() {
		var returnArray = [];
		Characters.find({}).forEach(function(char){ //we look through all characters we have access to
			if (canEditCharacter(char._id)) {
				returnArray.push(char)
			}
		});
		return returnArray;
	},
});

Template.applyBuffDialog.events({
	"iron-select .target-dropdown": function(event){
		var detail = event.originalEvent.detail;
		var value = detail.item.getAttribute("name");
		Template.instance().selectedTarget.set(value);
	},
	"click #applyButton": function(event, instance){
		var targetId = Template.instance().selectedTarget.get();
		var parent = global[this.buff.parent.collection].findOne(this.buff.parent.id);
		console.log(parent, this.buff.parent);
		if (targetId === "default") {
			if (this.buff.target === "others") return; //we have "Select a character" selected
			targetId = this.buff.charId; //i.e. target self
		}

		//insert new buff
		newBuffId = Buffs.insert({
			charId: targetId,
			name: this.buff.name,
			description: this.buff.description,
			lifeTime: {total: this.buff.lifeTime.total},
			type: "custom",

			appliedBy: this.buff.charId,
			appliedByDetails: {
				name: parent.name,
				collection: this.buff.parent.collection,
			},
		});

		//insert children
		Attacks.find({"parent.id": this.buff._id}).forEach(function(doc){
			temp = _.clone(doc);
			temp.parent.id = newBuffId;
			temp.parent.collection = "Buffs";
			delete temp._id;

			Attacks.insert(temp);
		});
		Effects.find({"parent.id": this.buff._id}).forEach(function(doc){
			temp = _.clone(doc);
			temp.parent.id = newBuffId;
			temp.parent.collection = "Buffs";
			delete temp._id;

			Effects.insert(temp);
		});
		Proficiencies.find({"parent.id": this.buff._id}).forEach(function(doc){
			temp = _.clone(doc);
			temp.parent.id = newBuffId;
			temp.parent.collection = "Buffs";
			delete temp._id;

			Proficiencies.insert(temp);
		});
		popDialogStack();
	},
	"click #cancelButton": function(event, instance){
		popDialogStack();
	},
});

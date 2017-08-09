Template.customBuffView.helpers({
	toSelf: function() {
		if (this.buff.target === "self") {
			return " to self";
		} else {
			return "";
		}
	}
});

Template.customBuffView.events({
	"click .apply-buff-button": function(){
		if (this.buff.target !== "self") {
			pushDialogStack({
				template: "applyBuffDialog",
				data: {buff: this.buff},
				element: event.currentTarget,
			});
		}
		else {
			var targetId = this.buff.charId;
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
		}
	},
});
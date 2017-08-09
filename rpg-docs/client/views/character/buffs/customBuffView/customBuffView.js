const applyBuff = function(targetId, buff) {
	var parent = global[buff.parent.collection].findOne(buff.parent.id);

	//insert new buff
	newBuffId = Buffs.insert({
		charId: targetId,
		name: buff.name,
		description: buff.description,
		lifeTime: {total: buff.lifeTime.total},
		type: "custom",

		appliedBy: buff.charId,
		appliedByDetails: {
			name: parent.name,
			collection: buff.parent.collection,
		},
	});

	//insert children
	Attacks.find({"parent.id": buff._id}).forEach(function(doc){
		temp = _.clone(doc);
		temp.parent.id = newBuffId;
		temp.parent.collection = "Buffs";
		delete temp._id;

		Attacks.insert(temp);
	});
	Effects.find({"parent.id": buff._id}).forEach(function(doc){
		temp = _.clone(doc);
		temp.parent.id = newBuffId;
		temp.parent.collection = "Buffs";
		delete temp._id;

		Effects.insert(temp);
	});
	Proficiencies.find({"parent.id": buff._id}).forEach(function(doc){
		temp = _.clone(doc);
		temp.parent.id = newBuffId;
		temp.parent.collection = "Buffs";
		delete temp._id;

		Proficiencies.insert(temp);
	});
}

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
				callback: (targetId) => {
					if (!targetId) return;
					applyBuff(targetId, this.buff);
				},
			});
		}
		else {
			var targetId = this.buff.charId;
			applyBuff(targetId, this.buff);
		}
	},
});
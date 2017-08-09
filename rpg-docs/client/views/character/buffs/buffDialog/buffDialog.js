Template.buffDialog.helpers({
	buff: function(){
		return Buffs.findOne(this.buffId);
	},
});

Template.buffDialog.events({
	"click #deleteButton": function(event, instance){
		Buffs.remove(instance.data.buffId);
		popDialogStack();
	},
});

const typeDict = {
	"Features": "feature",
	"Items": "item",
	"Spells": "spell",
}; //really, we should only need these three

Template.buffDetails.helpers({
	appliedBy: function() {
		if (this.type == "inate") {
			return "Innate.";
		} else {
			var myName = Characters.findOne(this.charId).name;
			var applierCharacter = Characters.findOne(this.appliedBy) || {name: "???"}
			// "???" indicates that either we do not have read access to the buff-giver, or that the buff-giver does not exist.

			if (applierCharacter.name === myName) {
				var charName = "your "
			} else {
				if (applierCharacter.charName[applierCharacter.charName.length -1] === 's') {
					var charName = applierCharacter.charName + "' ";
				} else {
					var charName = applierCharacter.charName + "'s ";
				}
			}

			var type = typeDict[this.appliedByDetails.collection] || "";
			var applierThing = global[this.appliedByDetails.collection]
							&& global[this.appliedByDetails.collection].findOne(this.appliedByDetails.id)
							&& global[this.appliedByDetails.collection].findOne(this.appliedByDetails.id).name
							|| "unknown ability";

			return "Applied by " + charName + type + applierThing + ".";
		}
	},
});
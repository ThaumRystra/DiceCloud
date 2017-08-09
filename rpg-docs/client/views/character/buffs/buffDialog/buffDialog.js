Template.buffDialog.onCreated(function(){
	var buff = Buffs.findOne(this.buffId);
	Meteor.subscribe("singleCharacterName", buff.charId); //so we can access the names of public characters
});

Template.buffDialog.helpers({
	buff: function(){
		return Buffs.findOne(this.buffId);
	},
});

Template.buffDialog.events({
	"click #deleteButton": function(event, instance){
		Buffs.softRemoveNode(instance.data.buffId);
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
				if (applierCharacter.name[applierCharacter.name.length - 1] === 's') {
					var charName = applierCharacter.name + "' ";
				} else {
					var charName = applierCharacter.name + "'s ";
				}
			}

			var type = typeDict[this.appliedByDetails.collection] + " ";
			var applierThing = this.appliedByDetails.name;

			return "Applied by " + charName + type + applierThing + ".";
		}
	},
});
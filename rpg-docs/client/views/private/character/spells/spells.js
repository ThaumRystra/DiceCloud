var spellLevels = [
	{name: "Cantrips", level: 0},
	{name: "Level 1",  level: 1},
	{name: "Level 2",  level: 2},
	{name: "Level 3",  level: 3},
	{name: "Level 4",  level: 4},
	{name: "Level 5",  level: 5},
	{name: "Level 6",  level: 6},
	{name: "Level 7",  level: 7},
	{name: "Level 8",  level: 8},
	{name: "Level 9",  level: 9},
];

Template.spells.helpers({
	spellLists: function(){
		return SpellLists.find({charId: this._id}, {sort: {color: 1, name: 1}});
	},
	spellCount: function(list, charId){
		if (!list || !list.settings) return;
		if (list.settings.showUnprepared){
			return Spells.find(
				{charId: charId, "parent.id": list._id, level: this.level},
				{fields: {_id: 1, level: 1}}
			).count() > 0;
		} else {
			return Spells.find(
				{
					charId: charId,
					"parent.id": list._id,
					level: this.level,
					prepared: {$in: ["prepared", "always"]},
				},
				{fields: {_id: 1, level: 1}}
			).count() > 0;
		}
	},
	spells: function(listId, charId){
		return Spells.find(
			{charId: charId, "parent.id": listId, level: this.level},
			{sort: {color: 1, name: 1}}
		);
	},
	levels: function(){
		return spellLevels;
	},
	numPrepared: function(){
		return Spells.find({
				charId: Template.parentData()._id,
				"parent.id": this._id,
				prepared: "prepared",
			}).count();
	},
	order: function(){
		return _.indexOf(_.keys(colorOptions), this.color);
	},
	spellComponents: function(){
		var components = "";
		if (this.components.verbal){
			components += "V";
		}
		if (this.components.somatic){
			components += components ? ", S" : "S";
		}
		if (this.components.material){
			components += components ? ", M" : "M";
		}
		if (this.components.concentration){
			components += components ? ", C" : "C";
		}
		return components;
	},
	isPrepared: function(){
		return this.prepared === "prepared" || this.prepared === "always";
	},
	showSpell: function(listShowPrepped){
		if (listShowPrepped) {
			return true;
		} else {
			return this.prepared === "prepared" || this.prepared === "always";
		}
	},
	cantUnprepare: function(){
		return this.prepared === "always";
	},
	cantCast: function(level, char){
		for (var i = level; i <= 9; i++){
			if (Characters.calculate.attributeValue(char._id, "level" + i + "SpellSlots") > 0){
				return false;
			}
		}
		return true;
	},
	showSlots: function(char){
		return this.level && Characters.calculate.attributeBase(
			char._id, "level" + this.level + "SpellSlots"
		);
	},
	hasSlots: function(){
		for (var i = 1; i <= 9; i += 1){
			if (Characters.calculate.attributeBase(this._id, "level" + i + "SpellSlots")){
				return true;
			}
		}
		return false;
	},
	slotBubbles: function(char){
		var baseSlots = Characters.calculate.attributeBase(char._id, "level" + this.level + "SpellSlots");
		var currentSlots = Characters.calculate.attributeValue(char._id, "level" + this.level + "SpellSlots");
		var slotsUsed = baseSlots - currentSlots;
		var bubbles = [];
		var i;
		for (i = 0; i < currentSlots; i++){
			bubbles.push({
				icon: "radio-button-on",
				disabled: i !== currentSlots - 1 || !canEditCharacter(char._id), //last full slot not disabled
				attribute: "level" + this.level + "SpellSlots",
				charId: char._id,
			});
		}
		for (i = 0; i < slotsUsed; i++){
			bubbles.push({
				icon: "radio-button-off",
				disabled: i !== 0 || !canEditCharacter(char._id), //first empty slot not disabled
				attribute: "level" + this.level + "SpellSlots",
				charId: char._id,
			});
		}
		return bubbles;
	},
	slotStatName: function() {
		return "level" + this.level + "SpellSlots";
	},
});

Template.spells.events({
	"tap .slotBubble": function(event){
		var modifier;
		if (!event.currentTarget.disabled){
			var char = Characters.findOne(this.charId);
			if (event.currentTarget.icon === "radio-button-off"){
				if (
					Characters.calculate.attributeValue(char._id, this.attribute) <
					Characters.calculate.attributeBase(char._id, this.attribute)
				){
					modifier = {$inc: {}};
					modifier.$inc[this.attribute + ".adjustment"] = 1;
					Characters.update(this.charId, modifier, {validate: false});
				}
			} else {
				if (Characters.calculate.attributeValue(char._id, this.attribute) > 0){
					modifier = {$inc: {}};
					modifier.$inc[this.attribute + ".adjustment"] = -1;
					Characters.update(this.charId, modifier, {validate: false});
				}
			}
		}
		event.stopPropagation();
	},
	"tap .spellSlot": function(event, instance) {
		var name = "Level " + this.level + " Spell Slots";
		var stat = "level" + this.level + "SpellSlots";
		var charId = instance.data._id;
		GlobalUI.setDetail({
			template: "attributeDialog",
			data:     {name: name, statName: stat, charId: charId},
			heroId:   charId + stat,
		});
	},
	"tap .spellList .top": function(event){
		GlobalUI.setDetail({
			template: "spellListDialog",
			data:     {spellListId: this._id, charId: this.charId},
			heroId:   this._id,
		});
	},
	"tap .spell": function(event){
		GlobalUI.setDetail({
			template: "spellDialog",
			data:     {spellId: this._id, charId: this.charId},
			heroId:   this._id,
		});
	},
	"tap .addSpellList": function(event){
		var charId = this.charId;
		SpellLists.insert({
			name: "New SpellList",
			charId: this._id,
			saveDC: "8 + intelligenceMod + proficiencyBonus",
			attackBonus: "intelligenceMod + proficiencyBonus",
		}, function(error, id){
			if (!error){
				GlobalUI.setDetail({
					template: "spellListDialog",
					data:     {spellListId: id, charId: charId, startEditing: true},
					heroId:   id,
				});
			}
		});
	},
	"tap .addSpell": function(event){
		var charId = this.charId;
		var listId = SpellLists.findOne({charId: this._id})._id;
		Spells.insert({
			name: "New Spell",
			charId: this._id,
			parent: {
				id: listId,
				collection: "SpellLists",
			},
			prepared: "prepared",
		}, function(error, id){
			if (!error){
				GlobalUI.setDetail({
					template: "spellDialog",
					data:     {spellId: id, charId: charId, startEditing: true},
					heroId:   id,
				});
			}
		});
	},
	"tap .preparedCheckbox": function(event){
		event.stopPropagation();
	},
	"change .preparedCheckbox": function(event){
		var value = event.currentTarget.checked;
		if (this.prepared === "unprepared" && value)
			Spells.update(this._id, {$set: {prepared: "prepared"}});
		else if (this.prepared === "prepared" && !value)
			Spells.update(this._id, {$set: {prepared: "unprepared"}});
	},
	"tap .prepSpells": function(event){
		SpellLists.update(this._id, {$set: {"settings.showUnprepared": true}});
		event.stopPropagation();
	},
	"tap .finishPrep": function(event){
		SpellLists.update(this._id, {$set: {"settings.showUnprepared": false}});
		event.stopPropagation();
	},
});

var spellLevels = [
	{ name: "Cantrips", level: 0 },
	{ name: "Level 1",  level: 1 },
	{ name: "Level 2",  level: 2 },
	{ name: "Level 3",  level: 3 },
	{ name: "Level 4",  level: 4 },
	{ name: "Level 5",  level: 5 },
	{ name: "Level 6",  level: 6 },
	{ name: "Level 7",  level: 7 },
	{ name: "Level 8",  level: 8 },
	{ name: "Level 9",  level: 9 },
];

Template.spells.helpers({
	spellLists: function(){
		return SpellLists.find({charId: this._id});
	},
	spellCount: function(list, charId){
		if(list.settings.showUnprepared){
			return Spells.find( {charId: charId, listId: list._id, level: this.level}, 
							    {fields: {_id: 1, level: 1}} ).count() > 0;
		} else{
			return Spells.find( {charId: charId, listId: list._id, level: this.level, prepared: {$in: ["prepared", "always"]} }, 
								{fields: {_id: 1, level: 1}} ).count() > 0;
		}
	},
	spells: function(listId, charId){
		return Spells.find( {charId: charId, listId: listId, level: this.level} );
	},
	levels: function(){
		return spellLevels;
	},
	numPrepared: function(){
		return Spells.find({charId: Template.parentData()._id, listId: this._id, prepared: "prepared"}).count();
	},
	order: function(){
		return _.indexOf(_.keys(colorOptions), this.color);
	},
	spellComponents: function(){
		var components = "";
		if(this.components.verbal){
			components += "V"
		}
		if(this.components.somatic){
			components += components? ", S" : "S";
		}
		if(this.components.material){
			components += components? ", M" : "M";
			components += "("+this.components.material+")";
		}
		if(this.components.concentration){
			components += " - Requires concentration"
		}
		return components;
	},
	isPrepared: function(){
		return this.prepared === "prepared" || this.prepared === "always";
	},
	showSpell: function(listShowPrepped){
		if(listShowPrepped) {
			return true;
		} else {
			return this.prepared === "prepared" || this.prepared === "always";
		}
	},
	cantUnprepare: function(){
		return this.prepared === "always";
	}
});

Template.spells.events({
	"tap .containerTop": function(event){
		GlobalUI.setDetail({
			template: "spellListDialog",
			data:     {spellListId: this._id, charId: this.charId},
			heroId:   this._id
		});
	},
	"tap .spell": function(event){
		GlobalUI.setDetail({
			template: "spellDialog",
			data:     {spellId: this._id, charId: this.charId},
			heroId:   this._id
		});
	},
	"tap #addSpellList": function(event){
		var charId = this.charId;
		SpellLists.insert({
			name: "New SpellList", 
			charId: this._id,
			saveDC: "8 + intelligenceMod + proficiencyBonus",
			attackBonus: "intelligenceMod + proficiencyBonus"
		}, function(error, id){
			if(!error){
				GlobalUI.setDetail({
					template: "spellListDialog",
					data:     {spellListId: id, charId: charId},
					heroId:   id
				});
			}
		});
	},
	"tap #addSpell": function(event){
		var charId = this.charId;
		var listId = this.listId;
		Spells.insert({
			name: "New Spell", 
			charId: this._id,
			listId: SpellLists.findOne({charId: this._id})._id
		}, function(error, id){
			if(!error){
				GlobalUI.setDetail({
					template: "spellDialog",
					data:     {spellId: id, charId: charId, listId: listId},
					heroId:   id
				});
			}
		});
	},
	"tap .preparedCheckbox": function(event){
		event.stopPropagation();
	},
	"change .preparedCheckbox": function(event){
		var value = event.currentTarget.checked;
		if(this.prepared === "unprepared" && value)
			Spells.update(this._id, {$set: {prepared: "prepared"}});
		else if(this.prepared === "prepared" && !value)
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

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
	spellCount: function(listId, charId){
		console.log(listId, charId);
		return Spells.find( {charId: charId, listId: listId, level: this.level}, {fields: {_id: 1, level: 1}} ).count() > 0;
	},
    spells: function(listId, charId){
        return Spells.find( {charId: charId, listId: listId, level: this.level} );
    },
	levels: function(){
		return spellLevels;
	},
	numPrepared: function(){
		return Spells.find({charId: Template.parentData()._id, listId: this._id, prepared: "prepared"}).count();
	}
})
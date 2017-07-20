Template.buffEditList.helpers({
	buffs: function(){
		var selector = {
			"parent.id": this.parentId,
			"charId": this.charId,
		};
		// if (this.parentGroup){
		// 	selector["parent.group"] = this.parentGroup;
		// }
		return Buffs.find(selector);
	},
});

Template.buffEditList.events ({
	"tap #addBuffButton": function(event) {
		Buffs.insert({
			name:"New Buff",
			type:"custom",
			charId: this.charId,
			parent: {
				id: this.parentId,
				collection: this.parentCollection
			}
			// "parent.id": this.parentId,
			// "parent.collection": this.parentCollection
		});
	},
})
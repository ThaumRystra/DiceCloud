Template.strengthDialog.helpers({
	color: function(){
		if (this.color) return this.color + " white-text";
		var char = Characters.findOne(this.charId, {fields: {color: 1}});
		if (char) return getColorClass(char.color);
	},
});

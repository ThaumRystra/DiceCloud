Template.buffDialog.helpers({
	buff: function(){
		return Buffs.findOne(this.buffId);
	},
});

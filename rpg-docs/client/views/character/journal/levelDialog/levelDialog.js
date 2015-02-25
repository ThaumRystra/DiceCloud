Template.levelDialog.rendered = function(){
	var self = this;
	//update all autogrows after they've been filled
	var pata = this.$("paper-autogrow-textarea");
	pata.each(function(index, el){
		el.update($(el).children().get(0));
	})
	//update all input fields as well
	var input = this.$("paper-input");
	input.each(function(index, el){
		el.valueChanged();
	})
	//after the dialog is built, open it
	if (!this.alreadyRendered){
		Session.set("global.ui.detailShow", true);
		this.alreadyRendered = true;
	}
}

Template.levelDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail()
	},
	"tap #deleteLevel": function(){
		Levels.remove(this._id);
		GlobalUI.closeDetail()
	},
	"tap #addEffectButton": function(){
		Effects.insert({
			charId: this.charId,
			sourceId: this._id,
			operation: "add",
			type: "level"
		});
	},
	"change #levelValueInput": function(event){
		var value = event.currentTarget.value;
		Levels.update(this._id, {$set: {value: value}});
	}
});

Template.levelDialog.helpers({
	level: function(){
		return Levels.findOne(this.levelId);
	},
	effects: function(){
		return Effects.find({sourceId: this._id, type: "level"});
	}
});
var LIBRARY_CONDITIONS = _.omit(CONDITIONS, ["encumbered", "encumbered2", "encumbered3", "encumbered4"]);

Template.conditionLibraryDialog.onCreated(function(){
	this.selectedCondition = new ReactiveVar();
});

Template.conditionLibraryDialog.helpers({
	conditions: function(){
		return Object.keys(LIBRARY_CONDITIONS)
	},
	isSelected(condition){
		const selected = Template.instance().selectedCondition.get();
		return selected && selected === condition;
	},
});

Template.conditionLibraryDialog.events({
	"click .cancelButton": function(event, template){
		popDialogStack();
	},
	"click .okButton": function(event, template){
		popDialogStack(template.selectedCondition.get());
	},
	"click .library-condition": function(event, template){
		template.selectedCondition.set(this.condition);
	},
	"click #backButton": function(event, template){
		popDialogStack();
	},
});

Template.libraryCondition.helpers({
	conditionName: function(name){
		return LIBRARY_CONDITIONS[name].buff.name;
	},
})
Template.characterRestoreDialog.onCreated(function(){
	this.dump = {};
  this.valid = new ReactiveVar(false);
  this.error = new ReactiveVar(null);
});

Template.characterRestoreDialog.helpers({
	invalid(){
		return !Template.instance().valid.get();
	},
  error(){
    return Template.instance().error.get();
  },
});

const fail = function(instance){
  instance.valid.set(false);
  instance.error.set("Failed to convert file into a valid character");
  instance.dump = undefined;
};

Template.characterRestoreDialog.events({
	"input .fileInput": function(event, instance){
    let input = event.currentTarget.$.input;
    let reader = new FileReader();
    reader.onload = function(){
      let dumpString = reader.result;
      try {
        let dump = JSON.parse(dumpString);
        if (dump && dump.character && dump.collections){
          instance.valid.set(true);
          instance.error.set(null);
          instance.dump = dump;
        } else {
          fail(instance);
        }
      } catch (e) {
        fail(instance);
      }
    };
    reader.readAsText(input.files[0]);
	},
	"click .cancelButton": function(event, instance){
		popDialogStack();
	},
	"click .addButton": function(event, instance){
		popDialogStack(instance.dump);
	},
});

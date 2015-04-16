Template.baseDialog.onRendered(function(){
	updatePolymerInputs(this);
	//after the dialog is built, open it
	if (!this.alreadyRendered){
		Session.set("global.ui.detailShow", true);
		this.alreadyRendered = true;
	}
});

Template.baseDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail();
	}
});

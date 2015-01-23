this.GlobalUI = (function() {
	function GlobalUI() {}

	GlobalUI.dialog = {};

	GlobalUI.toast = function(text, className) {
		var toast;
		toast = $("[global-toast]")[0];
		toast.text = text;
		return toast.show();
	};
	
	GlobalUI.setDialog = function(opts){
		this.dialog = $("[global-dialog]")[0];
		Session.set("global.ui.dialogHeader", opts.heading);
		Session.set("global.ui.dialogData", opts.data);
		Session.set("global.ui.dialogTemplate", opts.template);
		Session.set("global.ui.dialogFullOnMobile", opts.fullOnMobile != null);
	};

	GlobalUI.showDialog = function(opts) {
		this.dialog = $("[global-dialog]")[0];
		Session.set("global.ui.dialogHeader", opts.heading);
		Session.set("global.ui.dialogData", opts.data);
		Session.set("global.ui.dialogTemplate", opts.template);
		Session.set("global.ui.dialogFullOnMobile", opts.fullOnMobile != null);
		return Tracker.afterFlush((function(_this) {
			return function() {
				return _this.dialog.open();
			};
		})(this));
	};

	GlobalUI.closeDialog = function() {
		return this.dialog.close();
	};

	return GlobalUI;

})();

Template.layout.helpers({
	globalDialogTemplate: function() {
		return Session.get("global.ui.dialogTemplate");
	},
	globalDialogData: function() {
		return Session.get("global.ui.dialogData");
	},
	globalDialogFullOnMobile: function() {
		return Session.get("global.ui.dialogFullOnMobile");
	},
	globalDialogHeader: function(){
		return Session.get("global.ui.dialogHeader");
	}
});

Template.layout.events({
	"core-overlay-close-completed [global-dialog]": function(e) {
		Session.set("global.ui.dialogTemplate", null);
		Session.set("global.ui.dialogData", null);
		return Session.set("global.ui.dialogFullOnMobile", null);
	},
});

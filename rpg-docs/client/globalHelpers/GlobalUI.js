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

	//To show a detail, first animate the click, with raising z-depth
	//then call this function with a template and data
	//the element should have a hero-id of detail-main
	GlobalUI.showDetail = function(opts) {
		Session.set("global.ui.detailData", opts.data);
		Session.set("global.ui.detailTemplate", opts.template);
		GlobalUI.detailHero = opts.hero;
		Session.set("global.ui.detailShow", true);
	};

	//if setting the detail rather than showing it, 
	//the template should contain the following in template.rendered
	//
	//if (!this.alreadyRendered){
	//	Session.set("global.ui.detailShow", true);
	//	this.alreadyRendered = true;
	//}
	GlobalUI.setDetail = function(opts) {
		Session.set("global.ui.detailData", opts.data);
		Session.set("global.ui.detailTemplate", opts.template);
		GlobalUI.detailHero = opts.hero;
	};

	GlobalUI.closeDetail = function(){
		Session.set("global.ui.detailShow", false);
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
	},
	globalDetailSelected: function(){
		return Session.get("global.ui.detailShow") ? 1 : 0;
	},
	globalDetailTemplate: function(){
		return Session.get("global.ui.detailTemplate");
	},
	globalDetailData: function(){
		return Session.get("global.ui.detailData");
	}
});

Template.layout.events({
	"core-overlay-close-completed [global-dialog]": function(e) {
		Session.set("global.ui.dialogTemplate", null);
		Session.set("global.ui.dialogData", null);
		return Session.set("global.ui.dialogFullOnMobile", null);
	},
	"core-animated-pages-transition-end [detail-pages]": function(e) {
		var detailOpened = Session.get("global.ui.detailShow");
		if(detailOpened){
			//HACK by putting core-selected back on the main content section
			//we stop it being hidden while the detail section is shown
			$("#mainContentSection").addClass("core-selected");
			//but we still want to track whether it is or isn't actually selected
			//so we can hide hero elements, since they are technically now shown as detail
			$("#mainContentSection").addClass("fake-selected");
		} else {
			Session.set("global.ui.detailData", null);
			Session.set("global.ui.detailTemplate", null);
			//remove the hero attribute
			var heroElem = GlobalUI.detailHero;
			heroElem && heroElem.attr("hero", null);
			heroElem && heroElem.find("[hero-id]").attr("hero", null);
			GlobalUI.detailHero = null;
		}
	},
	"core-animated-pages-transition-prepare": function(e) {
		var detailOpened = Session.get("global.ui.detailShow");
		if(detailOpened) {
			//add the hero attribute where needed
			var heroElem = GlobalUI.detailHero;
			heroElem && heroElem.attr("hero", "");
			heroElem && heroElem.find("[hero-id]").attr("hero", "");
		} else {
			$("#mainContentSection").removeClass("fake-selected");
		}
	},
	"tap #screenDim": function(e){
		GlobalUI.closeDetail();
	}
});

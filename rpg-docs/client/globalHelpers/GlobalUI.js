this.GlobalUI = (function() {
	function GlobalUI() {}

	GlobalUI.dialog = {};

	GlobalUI.toast = function(opts) {
		var toast;
		toast = $("[global-toast]")[0];
		toast.text = opts.text;
		Session.set("global.ui.toastTemplate", opts.template);
		Session.set("global.ui.toastData", opts.data);
		return toast.show();
	};

	GlobalUI.deletedToast = function(id, collection, itemName) {
		GlobalUI.toast({
			text: itemName ? itemName + " deleted" : "Deleted item from" + collection,
			template: "undoToast",
			data: {
				id: id,
				collection: collection
			}
		});
	};

	GlobalUI.setDialog = function(opts) {
		this.dialog = $("[global-dialog]")[0];
		Session.set("global.ui.dialogHeader", opts.heading);
		Session.set("global.ui.dialogData", opts.data);
		Session.set("global.ui.dialogTemplate", opts.template);
		Session.set("global.ui.dialogFullOnMobile", opts.fullOnMobile !== null);
	};

	GlobalUI.showDialog = function(opts) {
		this.dialog = $("[global-dialog]")[0];
		Session.set("global.ui.dialogHeader", opts.heading);
		Session.set("global.ui.dialogData", opts.data);
		Session.set("global.ui.dialogTemplate", opts.template);
		Session.set("global.ui.dialogFullOnMobile", opts.fullOnMobile !== null);
		return Tracker.afterFlush((function(_this) {
			return function() {
				return _this.dialog.open();
			};
		})(this));
	};

	GlobalUI.closeDialog = function() {
		return this.dialog.close();
	};

	//To show a detail, first animate the click, with raising z-depth
	//then call this function with a template and data
	//the element should have a hero-id of detail-main
	GlobalUI.showDetail = function(opts) {
		Session.set("global.ui.detailData", opts.data);
		Session.set("global.ui.detailTemplate", opts.template);
		Session.set("global.ui.detailHeroId", opts.heroId);
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
		Session.set("global.ui.detailHeroId", opts.heroId);
		if (window.history && window.history.pushState) {
			history.replaceState({detail: "closed", opts: opts}, "Detail Dialog");
			history.pushState({detail: "opened", opts: opts}, "Detail Dialog");
		}
	};

	var throttleBack = _.throttle(function() {
		history.back();
	}, 100, {trailing: false});

	GlobalUI.closeDetail = function() {
		if (window.history && history.pushState && history.state.detail === "opened") {
			throttleBack();
		} else {
			Session.set("global.ui.detailShow", false);
		}
	};

	GlobalUI.popStateHandler = function(e) {
		var state = e.originalEvent.state;
		if (state) {
			if (state.detail === "closed") {
				Session.set("global.ui.detailShow", false);
			} else if (state.detail === "opened") {
				var opts = state.opts;
				Session.set("global.ui.detailData", opts.data);
				Session.set("global.ui.detailTemplate", opts.template);
				Session.set("global.ui.detailHeroId", opts.heroId);
			}
		}
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
	globalDialogHeader: function() {
		return Session.get("global.ui.dialogHeader");
	},
	globalDetailSelected: function() {
		return Session.get("global.ui.detailShow") ? 1 : 0;
	},
	globalDetailTemplate: function() {
		return Session.get("global.ui.detailTemplate");
	},
	globalDetailData: function() {
		return Session.get("global.ui.detailData");
	},
	globalToastTemplate: function() {
		return Session.get("global.ui.toastTemplate");
	},
	globalToastData: function() {
		return Session.get("global.ui.toastData");
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
		if (!detailOpened) {
			Session.set("global.ui.detailData", null);
			Session.set("global.ui.detailTemplate", null);
			Session.set("global.ui.detailHeroId", null);
		}
	},
	"core-animated-pages-transition-prepare": function(e) {
		var detailOpened = Session.get("global.ui.detailShow");
		if (detailOpened) {
			//set up the transition
		} else {
			//undo hack
			$("#mainContentSection").removeClass("fake-selected");
		}
	},
	"tap #screenDim": function(e) {
		GlobalUI.closeDetail();
	}
});

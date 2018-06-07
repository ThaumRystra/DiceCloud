this.GlobalUI = (function() {
	function GlobalUI() {}
	var toast;
	GlobalUI.toast = function(opts) {
		if (!toast) toast = $("#global-toast")[0];
		if (_.isObject(opts)){
			toast.text = opts.text;
			Session.set("global.ui.toastTemplate", opts.template);
			Session.set("global.ui.toastData", opts.data);
		} else {
			toast.text = opts;
			Session.set("global.ui.toastTemplate");
			Session.set("global.ui.toastData");
		}
		return toast.show();
	};

	GlobalUI.deletedToast = function(id, collection, itemName) {
		GlobalUI.toast({
			text: itemName ? itemName + " deleted" : "Deleted item from" + collection,
			template: "undoToast",
			data: {
				id: id,
				collection: collection,
			},
		});
	};
	return GlobalUI;
})();

Template.layout.helpers({
	globalToastTemplate: function() {
		return Session.get("global.ui.toastTemplate");
	},
	globalToastData: function() {
		return Session.get("global.ui.toastData");
	},
});

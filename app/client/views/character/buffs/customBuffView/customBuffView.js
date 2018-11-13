const applyBuff = function(targetId, buff) {
	Meteor.call("applyBuff", buff._id, targetId)
	let target;
	if (targetId == buff.charId) {
		target = "self";
	} else {
		target = Characters.findOne(targetId) || {};
		target = target && target.name || "target"
	}
	GlobalUI.toast(`${buff.name || "Buff"} applied to ${target}`);
};

Template.customBuffView.helpers({
	toSelf: function() {
		if (this.buff.target === "self") {
			return " to self";
		} else {
			return "";
		}
	}
});

Template.customBuffView.events({
	"click .apply-buff-button": function(){
		if (this.buff.target !== "self") {
			pushDialogStack({
				template: "applyBuffDialog",
				data: {buff: this.buff},
				element: event.currentTarget,
				callback: (targetId) => {
					if (!targetId) return;
					applyBuff(targetId, this.buff);
				},
			});
		} else {
			var targetId = this.buff.charId;
			applyBuff(targetId, this.buff);
		}
	},
});

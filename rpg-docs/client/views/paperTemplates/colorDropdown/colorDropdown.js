Template.colorDropdown.helpers({
	colors: function(){
		return colorOptions;
	}
});

Template.colorDropdown.events({
	"click paper-item": function(event, instance){
		var color = event.currentTarget.getAttribute("name");
		instance.$(".colorDropdown").trigger({
			type: "color-change",
			color: color,
		});
	}
});

Template.colorDropdown.helpers({
	colors: function(){
		return colorOptions;
	}
});

Template.colorDropdown.events({
	"tap .colorMenuItem": function(event, instance){
		var color = event.currentTarget.getAttribute("name");
		instance.$("#colorDropdown").trigger({
			type: "color-change",
			color: color,
		});
	}
});

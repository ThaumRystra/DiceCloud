Template.colorDropdown.helpers({
	colors: function(){
		let colors = "";
		_.each(colorOptions, (option) => {
			colors += !colors ? `["${option.color}"` : `, "${option.color}"`;
		});
		colors += "]";
		return colors;
	},
	selectedColor: function(){
		const selected = _.find(colorOptions, (option) => option.key === this.color);
		return selected && selected.color;
	},
});

Template.colorDropdown.events({
	"color-picker-selected": function(event, instance){
		var color = event.originalEvent.detail.color;
		var option = _.find(colorOptions, (option) => {
			return option.color === color.toUpperCase()}
		);
		var key = option && option.key;
		instance.$("paper-swatch-picker").trigger({
			type: "color-change",
			color: key,
		});
	}
});

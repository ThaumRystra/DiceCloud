var getFractionCarried = function(char) {
	//find out the weight
	var weight = 0;
	Containers.find(
		{charId: char._id, isCarried: true}
	).forEach(function(container){
		weight += container.totalWeight();
	});
	Items.find(
		{charId: char._id, "parent.id": char._id},
		{fields: {weight : 1, quantity: 1}}
	).forEach(function(item){
		weight += item.totalWeight();
	});
	//get strength
	var strength = char.attributeValue("strength");
	var capacity = strength * 15;
	return weight / capacity;
};

Template.carryCapacityBar.helpers({
	carriedPercent: function() {
		var percent = 100 * getFractionCarried(this);
		return percent > 100 ? 100 : percent;
	},
	carriedColor: function() {
		var frac = getFractionCarried(this);
		if (frac < 1 / 3){
			return "#2196F3";
		} else if (frac < 2 / 3){
			return "#CDDC39";
		} else if (frac < 1) {
			return "#FFC107";
		} else {
			return "#F44336";
		}
	},
});

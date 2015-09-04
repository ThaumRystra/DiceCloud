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
	var strength = Characters.calculate.attributeValue(char._id, "strength");
	var carryMultiplier = Characters.calculate
		.attributeValue(char._id, "carryMultiplier");
	var capacity = strength * 15 * carryMultiplier;
	return weight / capacity;
};

Template.carryCapacityBar.onCreated(function() {
	var self = this;
	self.carriedFraction = new ReactiveVar(0);
	self.autorun(function() {
		self.carriedFraction.set(getFractionCarried(self.data));
	});
});

Template.carryCapacityBar.helpers({
	carriedPercent: function() {
		var percent = 100 * Template.instance().carriedFraction.get();
		return percent > 100 ? 100 : percent;
	},
	overCarriedPercent: function() {
		var percent = 100 * Template.instance().carriedFraction.get();
		var overPercent = percent - 100;
		if (overPercent < 0) return 0;
		if (overPercent > 100) return 100;
		return overPercent;
	},
	carriedColor: function() {
		var frac = Template.instance().carriedFraction.get();
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
	overCarriedColor: function() {
		var frac = Template.instance().carriedFraction.get();
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

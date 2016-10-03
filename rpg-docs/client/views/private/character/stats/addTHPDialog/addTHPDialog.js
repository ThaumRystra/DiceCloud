Template.addTHPDialog.events({
	"tap #addButton": function(event, instance){
		var max = +instance.find("#quantityInput").value;
		if (!max || max < 0) max = 0;
		TemporaryHitPoints.insert({
			charId: this.charId,
			name: instance.find("#nameInput").value,
			maximum: max,
			deleteOnZero: !!instance.find("#deleteWhenZeroCheckbox").checked,
		});
	}
});

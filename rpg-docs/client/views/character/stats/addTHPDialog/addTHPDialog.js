Template.addTHPDialog.events({
	"tap #addButton": function(event, instance){
		TemporaryHitPoints.insert({
			charId: this.charId,
			name: instance.find("#nameInput").value,
			maximum: +instance.find("#quantityInput").value,
			deleteOnZero: !!instance.find("#deleteWhenZeroCheckbox").checked,
		});
	}
});

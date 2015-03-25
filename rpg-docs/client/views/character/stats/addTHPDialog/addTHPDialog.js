Template.addTHPDialog.events({
	'tap #addButton': function(event, instance){
		console.log({
			charId: this.charId,
			maximum: +instance.find('#quantityInput').value,
			deleteOnZero: !!instance.find('#deleteWhenZeroCheckbox').checked
		});
		TemporaryHitPoints.insert({
			charId: this.charId,
			maximum: +instance.find('#quantityInput').value,
			deleteOnZero: !!instance.find('#deleteWhenZeroCheckbox').checked
		});
	}
});


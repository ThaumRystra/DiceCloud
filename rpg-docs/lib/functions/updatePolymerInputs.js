updatePolymerInputs = function(self){
	_.defer(function(){
		//update all autogrows after they've been filled
		var pata = self.$("paper-autogrow-textarea");
		pata.each(function(index, el){
			el.update($(el).children().get(0));
		});
		//update all input fields as well
		var input = self.$("paper-input");
		input.each(function(index, el){
			el.valueChanged();
		});
	});
};
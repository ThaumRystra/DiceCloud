Items = new Meteor.Collection('items');

Item = function(name, container){
	this.name = name;
	this.container = container;
	this.quantity = 1;
	this.weight = 0.0;
	//value in gold pieces
	this.value = 0;
	this.description = "";
	//is this item a coin, letter of credit, ect.
	this.tradeGood = false;
	this.stakcable = false;
	this.effects = [];
}

Items.helpers({
	totalValue: function(){
		return this.value * this.quantity;
	},
	pluralName: function(){
		if(this.stackable && this.plural && this.quantity > 1){
			return this.plural;
		} else{
			return this.name;
		}
	}
});

if(Meteor.isClient){
	Template.registerHelper("valueString", function(value){
		var resultArray = [];
		//sp
		var gp = Math.floor(value);
		if(gp > 0) resultArray.push(gp + "gp");
		//sp
		var sp = Math.floor(10 * (value % 1));
		if(sp > 0) resultArray.push(sp + "sp");
		//cp
		var cp = 10 * ((value * 10) % 1);
		cp = Math.round(cp * 1000) / 1000;
		if(cp > 0) resultArray.push(cp + "cp");

		//build string with correct spacing
		var result = "";
		for(var i = 0; i < resultArray.length; i++){
			//add a space between values
			if(i !== 0){
				result += " ";
			}
			result += resultArray[i];
		}
		return result;	
	});
}
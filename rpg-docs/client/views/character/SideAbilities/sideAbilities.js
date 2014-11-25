Template.sideAbilities.created = function(){
	Template.instance().openedAbility = new ReactiveVar(null);
};

Template.sideAbilities.helpers({
	openedAbility: function(){
		Template.instance().openedAbility.get();
	},
	selected: function(string){
		return Template.instance().openedAbility.get() === string;
	},
	expanded: function(){
		if(Template.instance().openedAbility.get() === null){
			return "collapse";
		} else{
			return "expand";
		}
	}
});

var abilityOpener = function(ability){
	return function(){
		if(Template.instance().openedAbility.get() === ability){
			Template.instance().openedAbility.set(null);
		} else{
			Template.instance().openedAbility.set(ability);
		}
	};
};

Template.sideAbilities.events({
	"click .strengthStub": abilityOpener("strength"),
	"click .dexterityStub": abilityOpener("dexterity"),
	"click .constitutionStub": abilityOpener("constitution"),
	"click .intelligenceStub": abilityOpener("intelligence"),
	"click .wisdomStub": abilityOpener("wisdom"),
	"click .charismaStub": abilityOpener("charisma")
});
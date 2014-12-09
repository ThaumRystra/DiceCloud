selectAttribute = function(name, title){
	Session.set("selectedAttribute", name);
	Session.set("selectedAttributeTitle", title);
	Session.set("editingEffect", null);
	document.querySelector("#attributeDialog").toggle();
};

selectSkill = function(name, title){
	Session.set("selectedSkill", name);
	Session.set("selectedSkillTitle", title);
	Session.set("editingEffect", null);
	document.querySelector("#skillDialog").toggle();
};

Template.stats.events({
	"click #armor": function(){
		console.log("clicked armor");
		selectAttribute("armor", "Armor")
	}
});

Template.attributeDialog.helpers({
	attributeTitle: function(){
		return Session.get("selectedAttributeTitle");
	},
	attributeName: function(){
		return Session.get("selectedAttribute");
	},
	attribute: function(){
		return this.character.getField(Session.get("selectedAttribute"));
	},
	effects: function(){
		var attribute = this.character.getField(Session.get("selectedAttribute"));
		return _.groupBy(attribute.effects, "operation");
	},
	effectValue: function(){
		return evaluateEffect(Template.parentData(1).character._id, this);
	}
});

Template.attributeEffect.helpers({
	editing: function(){
		return Session.get("editingEffect") === this._id;
	},
	editable: function(){
		return this.type === "editable";
	},
	operation: function(){
		switch(this.operation){
			case "add":
				return;
			case "mul":
				return Spacebars.SafeString("&times;");
			case "min":
				return "min";
			case "max":
				return "max";
			default:
				return this.operation;
		}
	},
	signedEffectValue: function(){
		var value = evaluateEffect(Template.parentData(1).character._id, this);
		return signedString(value);
	}
});

Template.attributeEffect.events({
	"click .editButton": function(event){
		Session.set("editingEffect", this._id);
	},
	"click #doneButton": function(event){
		var newEffect = {};
		//TODO setup the changed effect
		var attribute = Session.get("selectedAttribute");
		var charId = Template.parentData(2)._id;
		Meteor.call("updateEffect", charId, attribute, this._id, newEffect)
		Session.set("editingEffect", null);
	},
	"click #cancelButton": function(event){
		Session.set("editingEffect", null);
	},
	"click #deleteButton": function(event){
		console.log("check that ", Template.parentData(2), "is a character");
		var attribute = Session.get("selectedAttribute");
		var pullObject = {};
		pullObject[attribute + ".effects"] = {_id: this._id};
		Characters.update(Template.parentData(2)._id, {$pull: pullObject});
		Session.set("editingEffect", null);
	}
});

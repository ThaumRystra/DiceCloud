selectAttribute = function(name, title){
	Session.set("selectedAttribute", name);
	Session.set("selectedAttributeTitle", title);
	Session.set("editingEffect", null);
};

selectSkill = function(name, title){
	Session.set("selectedSkill", name);
	Session.set("selectedSkillTitle", title);
	Session.set("editingEffect", null);
};

Template.stats.created = function(){
	this.selectedSection = new ReactiveVar(0);
}

Template.stats.events({
	"tap .attribute": function(event){
		var instance = Template.instance();
		var selected = $(event.currentTarget).attr("hero-id");
		var current = Session.get("selectedAttribute");
		var f = function(){
			selectAttribute(selected, "Title");
			instance.selectedSection.set(1);
		}
		//we already have the dialog open
		if(instance.selectedSection.get() === 1 && current != selected){
			instance.selectedSection.set(0);
			_.delay(f, 200);
		} else {
			f();
		}
			
	},
	"tap #darkOverlay": function(event){
		Template.instance().selectedSection.set(0);
		// let the user click through before it is completely gone
		$("#darkOverlay").css("pointer-events", "none");
		// make clickable again later
		_.delay(function(){
			$("#darkOverlay").css("pointer-events", "auto");
		}, 500);
	}
});

Template.stats.helpers({
	selectedSection: function(){
		return Template.instance().selectedSection.get();
	},
	isHero: function(string){
		if(string === Session.get("selectedAttribute")||
		   string === Session.get("selectedSkill")){
			return "hero";
		}
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
	operationNumber: function(){
		switch(this.operation){
			case "add":
				return 0;
			case "mul":
				return 1;
			case "min":
				return 2;
			case "max":
				return 3;
			default:
				return -1;
		}
	},
	signedEffectValue: function(){
		var value = evaluateEffect(Template.parentData(1).character._id, this);
		return signedString(value);
	}
});

Template.attributeEffect.events({
	"tap #editButton": function(event){
		Session.set("editingEffect", this._id);
	},
	"tap #doneButton": function(event){
		var newEffect = {

		};
		//TODO setup the changed effect
		var attribute = Session.get("selectedAttribute");
		var charId = Template.parentData(2)._id;
		Meteor.call("updateEffect", charId, attribute, this._id, newEffect)
		Session.set("editingEffect", null);
	},
	"tap #cancelButton": function(event){
		Session.set("editingEffect", null);
	},
	"tap #deleteButton": function(event){
		var attribute = Session.get("selectedAttribute");
		var pullObject = {};
		pullObject[attribute + ".effects"] = {_id: this._id};
		Characters.update(Template.parentData(2)._id, {$pull: pullObject});
		Session.set("editingEffect", null);
	}
});

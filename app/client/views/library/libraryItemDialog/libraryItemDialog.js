Template.libraryItemDialog.onCreated(function(){
  this.autorun(() => {
    this.subscribe('libraryItem', Template.currentData().itemId);
  });
});

Template.libraryItemDialog.helpers({
  item(){
    return LibraryItems.findOne(this.itemId);
  },
  calculationOrValue(){
    return this.calculation || this.value;
  },
  indexedEffects(){
    let item = LibraryItems.findOne(this.itemId);
    if (!item) return;
    return _.map(item.effects, (effect, index) => {
      if (!effect) return;
      effect.index = index;
      return effect;
    });
  },
  indexedAttacks(){
    let item = LibraryItems.findOne(this.itemId);
    if (!item) return;
    return _.map(item.attacks, (attack, index) => {
      if (!attack) return;
      attack.index = index;
      return attack;
    });
  },
  operationIndex(operation){
    const ref = {
      base: 0,
      add: 1,
      mul: 2,
      min: 3,
      max: 4,
      advantage: 5,
      disadvantage: 6,
      passiveAdd: 7,
      fail: 8,
      conditional: 9,
    };
    return ref[operation];
  },
  damageTypeIndex(damageType){
    const ref = {
      bludgeoning: 0,
      piercing: 1,
      slashing: 2,
      acid: 3,
      cold: 4,
      fire: 5,
      force: 6,
      lightning: 7,
      necrotic: 8,
      poison: 9,
      psychic: 10,
      radiant: 11,
      thunder: 12,
    };
    return ref[damageType];
  },
  ready(){
    return Template.instance().subscriptionsReady();
  },
  cantEdit(){
    // Get itemId from the top level template data regardless of current context
    let itemId = Blaze.getData(Template.instance().view).itemId;
    let item = LibraryItems.findOne(itemId);
    if (!item) return;
    let library = Libraries.findOne(item.library);
    if (!library) return;
    let userId = Meteor.userId();
    return !(
      library.owner === userId ||
	    _.contains(library.writers, userId)
    );
  }
});

const bind = function(field){
  return _.debounce(function(event){
		const input = event.currentTarget;
		var value = input.value;
		LibraryItems.update(this.itemId, {
			$set: {[field]: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}, 300);
};

Template.libraryItemDialog.events({
  "click #backButton": function(){
		popDialogStack();
	},
  "click #deleteButton": function(){
    LibraryItems.remove(this.itemId);
		popDialogStack();
	},
  "input #libraryItemLibraryNameInput": bind("libraryName"),
  "input #libraryItemNameInput": bind("name"),
  "input #libraryItemPluralInput": bind("plural"),
  "input #libraryItemQuantityInput": bind("quantity"),
  "input #libraryItemValueInput": bind("value"),
  "input #libraryItemWeightInput": bind("weight"),
  "change #attunementCheckbox": function(event){
		LibraryItems.update(this.itemId, {
      $set: {requiresAttunement: event.currentTarget.checked}
    });
	},
  "change #incrementCheckbox": function(event){
		LibraryItems.update(this.itemId, {
      $set: {"settings.showIncrement": event.currentTarget.checked}
    });
	},
  "input #libraryItemDescriptionInput": bind("description"),

  // Effects
  "click #addEffect": function(event, template){
    LibraryItems.update(template.data.itemId, {
      $push: {
        effects: {operation: "add"}
      }
    });
  },
  "iron-select .operationMenu": function(event, template){
    var detail = event.originalEvent.detail;
    var opName = detail.item.getAttribute("name");
    if (opName == this.operation) return;
    Meteor.call("updateLibraryItemEffect", {
      itemId: template.data.itemId,
      effectIndex: this.index,
      field: "operation",
      value: opName,
    });
  },
  "input .LibraryItemEffectStat": _.debounce(function(event, template){
    Meteor.call("updateLibraryItemEffect", {
      itemId: template.data.itemId,
      effectIndex: this.index,
      field: "stat",
      value: event.currentTarget.value,
    });
  }, 300),
  "input .LibraryItemEffectValue": _.debounce(function(event, template){
    let value = event.currentTarget.value;
    if (value && _.isFinite(+value)){
      Meteor.call("updateLibraryItemEffect", {
        itemId: template.data.itemId,
        effectIndex: this.index,
        field: "value",
        unsetField: "calculation",
        value,
      });
    } else {
      Meteor.call("updateLibraryItemEffect", {
        itemId: template.data.itemId,
        effectIndex: this.index,
        field: "calculation",
        unsetField: "value",
        value,
      });
    }
  }, 300),
  "click .deleteEffect": function (event, template) {
    Meteor.call("removeLibraryItemEffect", {
      itemId: template.data.itemId,
      effectIndex: this.index,
    });
  },

  // Attacks
  "click #addAttack": function(event, template){
    LibraryItems.update(template.data.itemId, {
      $push: {
        attacks: {damageType: "slashing"}
      }
    });
  },
  "iron-select .damageTypeMenu": function(event, template){
    var detail = event.originalEvent.detail;
    var damageType = detail.item.getAttribute("name");
    if (damageType == this.damageType) return;
    Meteor.call("updateLibraryItemAttack", {
      itemId: template.data.itemId,
      attackIndex: this.index,
      field: "damageType",
      value: damageType,
    });
  },
  "input .LibraryItemAttackBonusInput": _.debounce(function(event, template){
    Meteor.call("updateLibraryItemAttack", {
      itemId: template.data.itemId,
      attackIndex: this.index,
      field: "attackBonus",
      value: event.currentTarget.value,
    });
  }, 300),
  "input .LibraryItemAttackDamageInput": _.debounce(function(event, template){
    Meteor.call("updateLibraryItemAttack", {
      itemId: template.data.itemId,
      attackIndex: this.index,
      field: "damage",
      value: event.currentTarget.value,
    });
  }, 300),
  "input .LibraryItemAttackDetailsInput": _.debounce(function(event, template){
    Meteor.call("updateLibraryItemAttack", {
      itemId: template.data.itemId,
      attackIndex: this.index,
      field: "details",
      value: event.currentTarget.value,
    });
  }, 300),

  "click .deleteAttack": function (event, template) {
    Meteor.call("removeLibraryItemAttack", {
      itemId: template.data.itemId,
      attackIndex: this.index,
    });
  },
});

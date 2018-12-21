import Creatures from '/imports/api/creature/Creatures.js';
import Actions from '/imports/api/creature/properties/Actions.js';
import Attacks from '/imports/api/creature/properties/Attacks.js';
import Attributes from '/imports/api/creature/properties/Attributes.js';
import Buffs from '/imports/api/creature/properties/Buffs.js';
import Bundles from '/imports/api/creature/properties/Bundles.js';
import Classes from '/imports/api/creature/properties/Classes.js';
import Conditions from '/imports/api/creature/properties/Conditions.js';
import CustomBuffs from '/imports/api/creature/properties/CustomBuffs.js';
import DamageMultipliers from '/imports/api/creature/properties/DamageMultipliers.js';
import Effects from '/imports/api/creature/properties/Effects.js';
import Experiences from '/imports/api/creature/properties/Experiences.js';
import Features from '/imports/api/creature/properties/Features.js';
import Notes from '/imports/api/creature/properties/Notes.js';
import Proficiencies from '/imports/api/creature/properties/Proficiencies.js';
import Skills from '/imports/api/creature/properties/Skills.js';
import SpellLists from '/imports/api/creature/properties/SpellLists.js';
import Spells from '/imports/api/creature/properties/Spells.js';
import Items from '/imports/api/inventory/Items.js';
import Containers from '/imports/api/inventory/Containers.js';

const checkRemovePermissions = function(userId, charId, creature){
  // Must be logged in
  if (!userId) {
    throw new Meteor.Error("Creatures.methods.removeCreature.denied",
    "You need to be logged in to remove a creature");
  }

  // Creature must exist
  if (!creature) {
    throw new Meteor.Error("Creatures.methods.removeCreature.denied",
    `No creature exists with the given id: ${charId}`);
  }

  // Must be creatures owner
  if (creature.owner !== userId){
    throw new Meteor.Error("Creatures.methods.removeCreature.denied",
    "Only the owner is allowed to remove a creature, you are not the owner");
  }
}

const removeRelatedDocuments = function(charId){
  Actions          .remove({charId});
  Attacks          .remove({charId});
  Attributes       .remove({charId});
  Buffs            .remove({charId});
  Bundles          .remove({charId});
  Classes          .remove({charId});
  Conditions       .remove({charId});
  CustomBuffs      .remove({charId});
  DamageMultipliers.remove({charId});
  Effects          .remove({charId});
  Experiences      .remove({charId});
  Features         .remove({charId});
  Notes            .remove({charId});
  Proficiencies    .remove({charId});
  Skills           .remove({charId});
  SpellLists       .remove({charId});
  Spells           .remove({charId});
  Items            .remove({charId});
  Containers       .remove({charId});
};

const removeCreature = new ValidatedMethod({
  name: "Creatures.methods.removeCreature", // DDP method name
  validate: null,
  run(charId) {
    let creature = Creatures.findOne(charId);
    checkRemovePermissions(this.userId, charId, creature);
    Creatures.remove(charId);
		this.unblock();
		removeRelatedDocuments(charId);
  },
});

export default removeCreature;

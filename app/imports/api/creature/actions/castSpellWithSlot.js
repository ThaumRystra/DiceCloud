import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import { doActionWork } from '/imports/api/creature/actions/doAction.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import getAncestorContext from '/imports/api/creature/actions/getAncestorContext.js';
import recomputeInventory from '/imports/api/creature/denormalise/recomputeInventory';
import recomputeInactiveProperties from '/imports/api/creature/denormalise/recomputeInactiveProperties';

const castSpellWithSlot = new ValidatedMethod({
  name: 'creatureProperties.castSpellWithSlot',
  validate: new SimpleSchema({
    spellId: SimpleSchema.RegEx.Id,
    slotId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
    targetId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({spellId, slotId, targetId}) {
    let spell = CreatureProperties.findOne(spellId);
		// Check permissions
    let creature = getRootCreatureAncestor(spell);
    assertEditPermission(creature, this.userId);
    let target = undefined;
    if (targetId) {
      target = Creatures.findOne(targetId);
      assertEditPermission(target, this.userId);
    }
    let slotLevel = spell.level || 0;
    if (slotLevel !== 0){
      let slot = CreatureProperties.findOne(slotId);
      if (!slot){
        throw new Meteor.Error('No slot',
          'Slot not found to cast spell');
      }
      if (!slot.currentValue){
        throw new Meteor.Error('No slot',
          'Slot depleted');
      }
      if (!(slot.spellSlotLevelValue >= spell.level)){
        throw new Meteor.Error('Slot too small',
          'Slot is not large enough to cast spell');
      }
      slotLevel = slot.spellSlotLevelValue;
      damagePropertyWork({
        property: slot,
        operation: 'increment',
        value: 1,
      });
    }
    let actionContext = getAncestorContext(spell);

    doActionWork({
      action: spell,
      actionContext: {slotLevel, ...actionContext},
      creature,
      targets: target ? [target] : [],
      method: this,
    });

    // Note these lines only recompute the top-level creature, not the nearest one
    // The acting creature might have a new item
    recomputeInventory(creature._id);
    // The spell might add properties which need to be activated
    recomputeInactiveProperties(creature._id);
    recomputeCreatureByDoc(creature);

    if (target){
      recomputeInventory(target._id);
      recomputeInactiveProperties(target._id);
      recomputeCreatureByDoc(target);
    }
  },
});

export default castSpellWithSlot;

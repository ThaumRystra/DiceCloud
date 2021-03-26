import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/Creatures.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import { doActionWork } from '/imports/api/creature/actions/doAction.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';

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
		doActionWork({
      action: spell,
      context: {slotLevel},
      creature,
      targets: target ? [target] : [],
      method: this,
    });
    // Note this only recomputes the top-level creature, not the nearest one
		recomputeCreatureByDoc(creature);
    if (target){
      recomputeCreatureByDoc(target);
    }
  },
});

export default castSpellWithSlot;

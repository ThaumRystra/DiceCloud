import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/creatures/Creatures';
import {
  getPropertyAncestors, getPropertyDescendants
} from '/imports/api/engine/loadCreatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';

// TODO Migrate this to the new action engine

const doAction = new ValidatedMethod({
  name: 'creatureProperties.doCastSpell',
  validate: new SimpleSchema({
    spellId: SimpleSchema.RegEx.Id,
    slotId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
    ritual: {
      type: Boolean,
      optional: true,
    },
    targetIds: {
      type: Array,
      defaultValue: [],
      maxCount: 20,
      optional: true,
    },
    'targetIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    scope: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({ spellId, slotId, ritual, targetIds = [], scope = {} }) {
    console.warn('Do cast spell not implemented');
    return;
    // Get action context
    let spell = CreatureProperties.findOne(spellId);
    const creatureId = spell.root.id;
    const actionContext = new ActionContext(creatureId, targetIds, this);

    // Check permissions
    assertEditPermission(actionContext.creature, this.userId);
    actionContext.targets.forEach(target => {
      assertEditPermission(target, this.userId);
    });

    const ancestors = getPropertyAncestors(creatureId, spell._id);
    ancestors.sort((a, b) => a.order - b.order);

    const properties = getPropertyDescendants(creatureId, spell._id);
    properties.push(spell);
    properties.sort((a, b) => a.order - b.order);

    // Spend the appropriate slot
    let slotLevel = spell.level || 0;
    let slot;

    // If a spell requires a slot, make sure a slot is spent
    if (spell.level && !spell.castWithoutSpellSlots && !(ritual && spell.ritual)) {
      slot = CreatureProperties.findOne(slotId);
      if (!slot) {
        throw new Meteor.Error('No slot',
          'Slot not found to cast spell');
      }
      if (!slot.value) {
        throw new Meteor.Error('No slot',
          'Slot depleted');
      }
      if (slot.attributeType !== 'spellSlot') {
        throw new Meteor.Error('Not a slot',
          'The given property is not a valid spell slot');
      }
      if (!slot.spellSlotLevel?.value) {
        throw new Meteor.Error('No slot level',
          'Slot does not have a spell slot level');
      }
      if (slot.spellSlotLevel.value < spell.level) {
        throw new Meteor.Error('Slot too small',
          'Slot is not large enough to cast spell');
      }
      slotLevel = slot.spellSlotLevel.value;
      damagePropertyWork({
        prop: slot,
        operation: 'increment',
        value: 1,
        actionContext,
      });
    }

    // Post the slot level spent to the log
    if (slot?.spellSlotLevel?.value) {
      actionContext.addLog({
        name: `Casting using a level ${slotLevel} spell slot`
      });
    } else if (slotLevel) {
      if (ritual) {
        actionContext.addLog({
          name: `Ritual casting at level ${slotLevel}`
        });
      } else {
        actionContext.addLog({
          name: `Casting at level ${slotLevel}`
        });
      }
    }

    actionContext.scope['slotLevel'] = { value: slotLevel };
    actionContext.scope['~slotLevel'] = { value: slotLevel };

    // Do the action
    doActionWork({
      properties, ancestors, actionContext, methodScope: scope,
    });

    // Force the characters involved to recalculate
    Creatures.update({
      _id: { $in: [creatureId, ...targetIds] }
    }, {
      $set: { dirty: true },
    });
  },
});

export default doAction;

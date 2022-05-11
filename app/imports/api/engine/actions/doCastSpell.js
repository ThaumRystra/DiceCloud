import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import { damagePropertyWork } from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import { doActionWork } from '/imports/api/engine/actions/doAction.js';
import { CreatureLogSchema } from '/imports/api/creature/log/CreatureLogs.js';

const doAction = new ValidatedMethod({
  name: 'creatureProperties.doCastSpell',
  validate: new SimpleSchema({
    spellId: SimpleSchema.RegEx.Id,
    slotId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
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
  run({spellId, slotId, targetIds = [], scope = {}}) {
    let spell = CreatureProperties.findOne(spellId);
		// Check permissions
    let creature = getRootCreatureAncestor(spell);

    assertEditPermission(creature, this.userId);

    // Get all the targets and make sure we can edit them
    let targets = [];
    targetIds.forEach(targetId => {
      let target = Creatures.findOne(targetId);
      assertEditPermission(target, this.userId);
      targets.push(target);
    });

    // Fetch all the action's ancestor creatureProperties
    const ancestorIds = [];
    spell.ancestors.forEach(ref => {
      if (ref.collection === 'creatureProperties') {
        ancestorIds.push(ref.id);
      }
    });

    // Get cursor of ancestors
    const ancestors = CreatureProperties.find({
      _id: {$in: ancestorIds},
    }, {
      sort: {order: 1},
    });

    // Get cursor of the properties
    const properties = CreatureProperties.find({
      $or: [{_id: spell._id}, {'ancestors.id': spell._id}],
      removed: {$ne: true},
    }, {
      sort: {order: 1},
    });

    // Spend the appropriate slot
    let slotLevel = spell.level || 0;
    let slot;
    if (slotId && !spell.castWithoutSpellSlots){
      slot = CreatureProperties.findOne(slotId);
      if (!slot){
        throw new Meteor.Error('No slot',
          'Slot not found to cast spell');
      }
      if (!slot.value){
        throw new Meteor.Error('No slot',
          'Slot depleted');
      }
      if (slot.attributeType !== 'spellSlot'){
        throw new Meteor.Error('Not a slot',
          'The given property is not a valid spell slot');
      }
      if (!slot.spellSlotLevel?.value){
        throw new Meteor.Error('No slot level',
          'Slot does not have a spell slot level');
      }
      if (slot.spellSlotLevel.value < spell.level){
        throw new Meteor.Error('Slot too small',
          'Slot is not large enough to cast spell');
      }
      slotLevel = slot.spellSlotLevel.value;
      damagePropertyWork({
        property: slot,
        operation: 'increment',
        value: 1,
      });
    }

    scope['slotLevel'] = slotLevel;

    // Post the slot level spent to the log
    const log = CreatureLogSchema.clean({
      creatureId: creature._id,
      creatureName: creature.name,
    });
    if (slot?.spellSlotLevel?.value){
      log.content.push({
        name: `Casting using a level ${slotLevel} spell slot`
      });
    } else if (slotLevel) {
      log.content.push({
        name: `Casting at level ${slotLevel}`
      });
    }

    // Do the action
    doActionWork({ creature, targets, properties, ancestors, method: this, methodScope: scope, log });
    
    Creatures.update({
      _id: { $in: [creature._id, ...targetIds] }
    }, {
      dirty: true
    });
  },
});

export default doAction;

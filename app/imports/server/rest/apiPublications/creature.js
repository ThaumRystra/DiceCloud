import SimpleSchema from 'simpl-schema';
import { JsonRoutes } from 'meteor/simple:json-routes';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import computeCreature from '/imports/api/engine/computeCreature.js';
import VERSION from '/imports/constants/VERSION.js';
import { getCreature, getProperties, getVariables } from '/imports/api/engine/loadCreatures';

JsonRoutes.add('get', 'api/creature/:id', function (req, res) {
  const creatureId = req.params.id;

  // Validate the creature ID
  try {
    new SimpleSchema({
      creatureId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ creatureId });
  } catch (e) {
    const error = new Meteor.Error('invalid-id', 'Invalid creature ID provided');
    error.statusCode = 400;
    throw error;
  }

  // Check permissions
  const creature = getCreature(creatureId);
  const userId = req.userId;
  try {
    assertViewPermission(creature, userId)
  } catch (e) {
    e.statusCode = 403;
    throw e;
  }

  // Compute the creature first if need be
  if (creature.computeVersion !== VERSION) {
    try {
      computeCreature(creatureId)
    } catch (e) {
      e.statusCode = 500;
      console.error(e)
      throw e;
    }
  }

  // Send the results
  JsonRoutes.sendResult(res, {
    data: {
      creatures: [creature],
      creatureProperties: getProperties(creatureId),
      creatureVariables: getVariables(creatureId),
    },
  });

});

/*
Meteor.publish('api-creature', function (creatureId) {
  try {
    new SimpleSchema({
      creatureId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ creatureId });
  } catch (e) {
    console.error(e)
    this.error(e);
    return;
  }
  const userId = this.userId;
  const creatureCursor = Creatures.find({
    _id: creatureId,
  });
  const creature = creatureCursor.fetch()[0];
  try {
    assertViewPermission(creature, userId)
  } catch (e) {
    console.error(e)
    this.error(e);
    return;
  }
  if (creature.computeVersion !== VERSION) {
    try {
      computeCreature(creatureId)
    } catch (e) {
      console.error(e)
    }
  }
  return [
    creatureCursor,
    CreatureProperties.find({
      'ancestors.id': creatureId,
    }),
    CreatureVariables.find({
      _creatureId: creatureId,
    }),
  ];
}, {
  url: 'api/creature/:0'
});
*/

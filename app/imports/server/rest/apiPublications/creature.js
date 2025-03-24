import SimpleSchema from 'simpl-schema';
import { JsonRoutes } from 'meteor/simple:json-routes';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions';
import computeCreature from '/imports/api/engine/computeCreature';
import VERSION from '/imports/constants/VERSION';
import { getCreature, getProperties, getVariables } from '/imports/api/engine/loadCreatures';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION';

JsonRoutes.add('get', 'api/creature/:id', function (req, res) {
  const creatureId = req.params.id;

  // Validate the creature ID
  try {
    new SimpleSchema({
      creatureId: {
        type: String,
        max: 32,
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
      meta: {
        schemaVersion: SCHEMA_VERSION,
      },
      creatures: [creature],
      creatureProperties: getProperties(creatureId),
      creatureVariables: getVariables(creatureId),
    },
  });

});

import '/imports/api/simpleSchemaConfig';
//import testTypes from './testTypes/index';
import applyTriggers from '/imports/api/engine/actions/applyTriggers.testFn';
import { doActionWork } from './doAction';
import { CreatureLogSchema } from '/imports/api/creature/log/CreatureLogs';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import Creatures from '/imports/api/creature/creatures/Creatures';

function cleanProp(prop) {
  let schema = CreatureProperties.simpleSchema(prop);
  return schema.clean(prop);
}

function cleanCreature(creature) {
  let schema = Creatures.simpleSchema(creature);
  return schema.clean(creature);
}

// Fake ActionContext to test actions with
const creatureId = 'actionTestCreatureId';
const creatureName = 'Action Test Creature';
const testActionContext = {
  creature: cleanCreature({
    _id: creatureId,
  }),
  log: CreatureLogSchema.clean({
    creatureId: creatureId,
    creatureName: creatureName,
  }),
  scope: {},
  addLog(content) {
    if (content.name || content.value) {
      this.log.content.push(content);
    }
  },
  writeLog: () => { },
}

const action = cleanProp({
  type: 'action',
});
const actionAncestors = [];

describe('Do Action', function () {
  it('Does an empty action', function () {
    doActionWork({
      properties: [action],
      ancestors: actionAncestors,
      actionContext: testActionContext,
      methodScope: {},
    });
  });
  //testTypes.forEach(test => it(test.text, test.fn));
});

describe('Action utility functions', function () {
  it('Triggers match tags', applyTriggers);
})

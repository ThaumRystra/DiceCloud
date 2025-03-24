import '/imports/api/simpleSchemaConfig.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import propsFromForest, { ForestProp } from '/imports/api/engine/computation/utility/propsFromForest.testFn';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import computeCreature from '/imports/api/engine/computeCreature';
import { loadCreature, unloadAllCreatures } from '/imports/api/engine/loadCreatures';
import EngineActions, { EngineAction } from '/imports/api/engine/action/EngineActions';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import { LogContent, Mutation, Removal, Update } from '/imports/api/engine/action/tasks/TaskResult';
import inputProvider from './userInput/inputProviderForTests.testFn';
/**
 * Removes all creatures, properties, and creatureVariable documents from the database
 */
export async function removeAllCreaturesAndProps() {
  if (Meteor.isServer) {
    unloadAllCreatures();
    return Promise.all([
      CreatureProperties.removeAsync({}),
      Creatures.removeAsync({}),
      CreatureVariables.removeAsync({}),
    ]);
  } else {
    CreatureProperties.find({}).forEach(doc => CreatureProperties.remove(doc._id));
    Creatures.find({}).forEach(doc => Creatures.remove(doc._id));
    CreatureVariables.find({}).forEach((doc: any) => CreatureVariables.remove(doc._id));
  }
}

/**
 * Creates a test creature with all its props computed and loaded into memory
 * You may need to set the timeout of a test higher for this function to conclude
 * as it is inserting and reading potentially many database documents
 */
export async function createTestCreature(creature: TestCreature) {
  const dummySubscription = Tracker.autorun(() => undefined)
  await Creatures.insertAsync({
    _id: creature._id,
    name: creature.name || 'Test Creature',
    owner: Random.id(),
    dirty: true,
  } as any);
  const propsInserted = propsFromForest(creature.props, creature._id).map(prop => {
    return CreatureProperties.insertAsync(prop);
  });
  await Promise.all(propsInserted);
  loadCreature(creature._id, dummySubscription);
  await computeCreature(creature._id,);
}

export type TestCreature = {
  _id: string;
  name?: string;
  props: ForestProp[];
}

/**
 * get a list of random Ids
 */
export const getRandomIds = (count: number) => new Array(count).fill(undefined).map(() => Random.id());

/**
 * Creates a new Engine Action and applies the specified creature property
 * @param propId The _id of the property, any property that the engine can apply will work
 * @param userInputFn A function that simulates user input
 * @returns The Engine Action with mutations resulting from running the action
 */
export async function runActionById(propId: string, targetIds?: string[], userInput = inputProvider) {
  const prop = await CreatureProperties.findOneAsync(propId);
  const actionId = await createAction(prop, targetIds);
  const action = await EngineActions.findOneAsync(actionId);
  if (!action) throw 'Action is expected to exist';
  await applyAction(action, userInput, { simulate: true });
  return action;
}

/**
 * Creates and inserts a new Engine Action into the database
 * @param prop The property to start applying
 * @param targetIds A list of target ids
 * @returns Promise< id of the inserted Engine Action >
 */
function createAction(prop: any, targetIds?: string[]) {
  const action: EngineAction = {
    creatureId: prop.root.id,
    results: [],
    taskCount: 0,
    task: {
      prop,
      targetIds: targetIds || [],
    }
  };
  return EngineActions.insertAsync(action);
}

/**
 * Get all the mutations in the results of an engineAction
 */
export function allMutations(action: EngineAction) {
  const mutations: Mutation[] = [];
  action.results.forEach(result => {
    result.mutations.forEach(mutation => {
      mutations.push(mutation);
    });
  });
  return mutations;
}

/**
 * Get all the updates in all mutations in the result of an Engine Action
 */
export function allUpdates(action: EngineAction) {
  const updates: Update[] = [];
  allMutations(action).forEach(mutation => {
    mutation.updates?.forEach(update => {
      updates.push(update);
    });
  });
  return updates;
}
/**
 * Get all the inserts in all mutations in the result of an Engine Action
 */
export function allInserts(action: EngineAction) {
  const inserts: any[] = [];
  allMutations(action).forEach(mutation => {
    mutation.inserts?.forEach(update => {
      inserts.push(update);
    });
  });
  return inserts;
}

/**
 * Get all the removals in all mutations in the result of an Engine Action
 */
export function allRemovals(action: EngineAction) {
  const removals: Removal[] = [];
  allMutations(action).forEach(mutation => {
    mutation.removals?.forEach(update => {
      removals.push(update);
    });
  });
  return removals
}

/**
 * Get all the log content in all mutations in the result of an Engine Action
 */
export function allLogContent(action: EngineAction) {
  const contents: LogContent[] = [];
  allMutations(action).forEach(mutation => {
    mutation.contents?.forEach(logContent => {
      contents.push(logContent);
    });
  });
  return contents;
}

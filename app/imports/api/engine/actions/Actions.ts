import SimpleSchema from 'simpl-schema';
import { forEach, isEmpty } from 'lodash';
import LogContentSchema from '/imports/api/creature/log/LogContentSchema';
import { getPropertyChildren, getSingleProperty } from '/imports/api/engine/loadCreatures';
import recalculateInlineCalculations from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateInlineCalculations';

const Actions = new Mongo.Collection<ActionWithId>('actions');

interface Action {
  creatureId: string;
  rootPropId: string;
  targetIds?: string[];
  userInputNeeded?: boolean;
  stepThrough?: boolean;
  taskQueue: Task[];
  results: TaskResult[];
}

interface ActionWithId extends Action {
  _id: string;
}

type Task = {
  propId: string;
  targetIds: string[];
}

type TaskResult = {
  propId: string;
  targetIds: string[];
  scope: any;
  mutations: Mutation[];
}

type PartialTaskResult = {
  scope: any;
  mutations: Mutation[];
}

type Mutation = {
  // Which creatures the mutation is applied to
  targetIds: string[];
  // What changes in the database
  updates?: {
    propId: string;
    set: any;
  }[];
  // Logged when this is applied
  contents?: LogContent[];
}

type LogContent = {
  name?: string;
  value?: string;
  inline?: boolean;
  context?: any;
}

const ActionSchema = new SimpleSchema({
  creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  rootPropId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  targetIds: {
    type: Array,
    defaultValue: [],
  },
  'targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  userInputNeeded: {
    type: Boolean,
    defaultValue: false,
  },
  stepThrough: {
    type: Boolean,
    defaultValue: false,
  },

  // A stack of tasks to apply
  // Each task has a propId to apply and a targetId list
  taskQueue: {
    type: Array,
  },
  'taskQueue.$': {
    type: Object,
  },
  'taskQueue.$.propId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'taskQueue.$.targetIds': {
    type: Array,
    defaultValue: [],
  },
  'taskQueue.$.targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  // Applied properties
  results: {
    type: Array,
    defaultValue: [],
  },
  'results.$': {
    type: Object,
  },
  // The property and target ids popped off the task stack
  // Pushing these to the top of the stack and deleting the results from this point onwards
  // Should re-run the action identically from this point
  'results.$.propId': {
    type: Object,
  },
  'result.$.targetIds': {
    type: Array,
    defaultValue: [],
  },
  'result.$.targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Changes in local scope made by this result
  'results.$.scope': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // database changes
  'results.$.mutations': {
    type: Array,
    optional: true,
  },
  'results.$.mutations.$': {
    type: Object,
  },
  'results.$.mutations.$.propId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'results.$.mutations.$.set': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  'results.$.mutations.$.logContent': {
    type: LogContentSchema,
  },
});

Actions.attachSchema(ActionSchema);

/**
 * Create a new action ready to be run starting at the given property (or its 'before' triggers)
 * @param prop 
 */
export async function createAction(prop) {
  const action: Action = {
    creatureId: prop.ancestors[0].id,
    rootPropId: prop._id,
    taskQueue: [],
    results: [],
  };
  pushPropAndTriggers(action, prop);
  return Actions.insertAsync(action);
}

// Run an already created action
export async function runAction(actionId: string, userInput) {
  const action = await Actions.findOneAsync(actionId);
  if (!action) throw new Meteor.Error('Not found', 'The action does not exist');
  const originalAction = EJSON.clone(action);
  do {
    // Get the next task
    const task = action.taskQueue.shift();
    // If there isn't one, stop
    if (!task) break;

    // Apply the prop
    await applyProperty(task, action, userInput);
  } while (!action.userInputNeeded || !action.stepThrough)

  // Persist changes to the action
  return writeChangedAction(originalAction, action);
}

function writeChangedAction(original: ActionWithId, changed: ActionWithId) {
  const $set = {};
  for (const key of ActionSchema.objectKeys()) {
    if (!EJSON.equals(original[key], changed[key])) {
      $set[key] = changed[key];
    }
  }
  if (!isEmpty($set)) {
    return Actions.updateAsync(original._id, { $set });
  }
}

async function applyProperty(task, action, userInput) {
  // Ensure the prop exists
  const prop = await getSingleProperty(action.creatureId, task.propId);
  if (!prop) throw new Meteor.Error('Not found', 'Property could not be found');
  if (prop.deactivatedByToggle) return;

  // Apply the property
  const { result }: { result: TaskResult } = await applyPropertyByType[prop.type]?.(prop, task, action, userInput);

  // store the task's details and save the result
  result.propId = task.propId;
  result.targetIds = task.targetIds;
  action.results.push(result);
}

/**
 * Push a prop and its before/after triggers to the task stack
 * Triggers will share the same targetIds as the prop task
 * @param action The action to add the task to
 * @param prop The property to make a task of
 * @param targetIds The targetIds the prop and triggers will apply to
 */
function pushPropAndTriggers(action: Action, prop, targetIds?) {
  // Push the before triggers to the queue
  forEach(prop.triggerIds?.before, triggerId => {
    action.taskQueue.push({ propId: triggerId, targetIds });
  });

  // Push the prop task to the queue
  action.taskQueue.push({ propId: prop._id, targetIds });

  // Push the after triggers to the queue
  forEach(prop.triggerIds?.after, triggerId => {
    action.taskQueue.push({ propId: triggerId, targetIds });
  });
}

/**
 * Push all the children of a prop and all related triggers to the task stack
 * Triggers will share the same targetIds as the prop task
 * @param action The action to add the task to
 * @param prop The property to make a task of
 * @param targetIds The targetIds the prop and triggers will apply to
 */
async function pushChildrenAndTriggers(action: Action, prop, targetIds) {
  const children = await getPropertyChildren(action.creatureId, prop._id);

  // Push the child tasks and related triggers to the stack
  forEach(children, childProp => {
    pushPropAndTriggers(action, childProp, targetIds)
  });

  // After the children run, it must run 'afterChildren' triggers
  // Make sure they're on the bottom of the stack
  forEach(prop.triggerIds?.afterChildren, triggerId => {
    action.taskQueue.push({ propId: triggerId, targetIds });
  });
}

function createResult(prop): PartialTaskResult {
  // Add  the property to the action's local scope
  return {
    scope: {
      [`#${prop.type}`]: { _propId: prop._id }
    },
    mutations: [],
  };
}

// Return result object
// No side effects except pushing to taskQueue
const applyPropertyByType = {

  async note(prop, task: Task, action) {
    const result = createResult(prop);

    let contents: LogContent[] | undefined = undefined;
    const logContent = { name: prop.name, value: undefined };
    if (prop.summary?.text) {
      recalculateInlineCalculations(prop.summary, action);
      logContent.value = prop.summary.value;
    }

    if (logContent.name || logContent.value) {
      contents = [logContent];
    }
    // Log description
    if (prop.description?.text) {
      recalculateInlineCalculations(prop.description, action);
      if (!contents) contents = [];
      contents.push({ value: prop.description.value });
    }
    if (contents) {
      result.mutations.push({
        contents,
        targetIds: task.targetIds,
      });
    }

    await pushChildrenAndTriggers(action, prop, task.targetIds);

    return result;
  }

}

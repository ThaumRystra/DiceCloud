import SimpleSchema from 'simpl-schema';
import { forEach, get, isEmpty, pick } from 'lodash';
import LogContentSchema from '/imports/api/creature/log/LogContentSchema';
import { getPropertyChildren, getSingleProperty, getVariables } from '/imports/api/engine/loadCreatures';
import recalculateInlineCalculations from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateInlineCalculations';
import recalculateCalculation from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateCalculation';
import rollDice from '/imports/parser/rollDice';

/* eslint-disable  @typescript-eslint/no-explicit-any */

const Actions = new Mongo.Collection<ActionWithId>('actions');

export interface Action {
  creatureId: string;
  rootPropId: string;
  targetIds?: string[];
  userInputNeeded?: any;
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
  step?: number,
}

type TaskResult = {
  propId: string;
  targetIds: string[];
  scope: any;
  popScope?: any;
  pushScope?: any;
  mutations: Mutation[];
}

class PartialTaskResult {
  scope: any;
  // Consume pushed changes from the local scope, every change pushed must be popped later
  popScope?: any;
  // Push changes to the scope if the same task intends to consume them in later steps
  // These changes will be marked as _busy until they are consumed
  // This allows a property to run in between steps of the same property type without
  // bashing the variables used to maintain state between steps while still exposing
  // those variables to triggers that need to change them
  // If multiple properties use the same variable at once, the values used by outer
  // properties can be found on variable.previous
  pushScope?: any;
  mutations: Mutation[];
  constructor() {
    this.mutations = [];
    this.scope = {};
  }
  // Appends the log content to the latest mutation
  appendLog(content: LogContent, targetIds: string[]) {
    if (!this.mutations.length) {
      this.mutations.push({ targetIds, contents: [] });
    }
    const latestMutation = this.mutations[this.mutations.length - 1]
    if (!latestMutation.contents) {
      latestMutation.contents = [];
    }
    latestMutation.contents.push(content);
  }
}

type Mutation = {
  // Which creatures the mutation is applied to
  targetIds: string[];
  // What changes in the database
  updates?: Update[];
  // Logged when this is applied
  contents?: LogContent[];
}

export type Update = {
  propId: string;
  type: string,
  set?: any;
  inc?: any;
}

export type LogContent = {
  name?: string;
  value?: string;
  inline?: boolean;
  context?: any;
  silenced?: boolean;
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
    type: Object,
    optional: true,
    blackbox: true,
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
  'taskQueue.$.step': {
    type: Number,
    optional: true,
  },
  'taskQueue.$.targetIds': {
    type: Array,
    defaultValue: [],
  },
  'taskQueue.$.targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  // Pseudo properties that don't exist on the character, but can be applied by the action
  // {_id: prop}
  'taskProperties': {
    type: Object,
    blackbox: true,
    defaultValue: {},
  },
  // Results that have been partially computed, but require more steps
  // {_id: partialResult}
  'deferredResults': {
    type: Object,
    blackbox: true,
    defaultValue: {},
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
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'results.$.targetIds': {
    type: Array,
    defaultValue: [],
  },
  'results.$.targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Changes that override the local scope
  'results.$.scope': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // Changes that consume pushed values from the local scope
  'results.$.popScope': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // Changes that push values to the local scope
  'results.$.pushScope': {
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
  'results.$.mutations.$.targetIds': {
    type: Array,
  },
  'results.$.mutations.$.targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'results.$.mutations.$.updates': {
    type: Array,
    optional: true,
  },
  'results.$.mutations.$.updates.$': {
    type: Object,
  },
  'results.$.mutations.$.updates.$.propId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Required, because CreatureProperties.update requires a selector of { type }
  'results.$.mutations.$.updates.$.type': {
    type: String,
  },
  'results.$.mutations.$.updates.$.set': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  'results.$.mutations.$.updates.$.inc': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  'results.$.mutations.$.contents': {
    type: Array,
    optional: true,
  },
  'results.$.mutations.$.contents.$': {
    type: LogContentSchema,
  },
});

// @ts-expect-error Collections2 lacks TypeScript support
Actions.attachSchema(ActionSchema);

export default Actions;

// Run an already created action
export async function runAction(actionId: string, userInput?) {
  const action = await Actions.findOneAsync(actionId);
  if (!action) throw new Meteor.Error('Not found', 'The action does not exist');
  const originalAction = EJSON.clone(action);
  let count = 0;
  do {
    // If there isn't a next task, stop
    if (!action.taskQueue.length) break;
    await applyNextTask(action, userInput);
    count += 1;
    if (count > 100) {
      break;
    }
  } while (!action.userInputNeeded && !action.stepThrough)

  // Persist changes to the action
  const writePromise = writeChangedAction(originalAction, action);
  if (count > 100) {
    throw new Meteor.Error('Too many properties', 'Only 100 properties may fire at a time');
  }
  return writePromise;
}

// TODO create a function to get the effective value of a property,
// simulating all the result updates in the action so far

async function applyNextTask(action: Action, userInput?) {
  // Get the next task
  const task = action.taskQueue.shift();
  if (!task) throw 'Next task does not exist';

  // Get property
  const prop = await getSingleProperty(action.creatureId, task.propId);

  // Ensure the prop exists
  if (!prop) throw new Meteor.Error('Not found', 'Property could not be found');
  if (prop.deactivatedByToggle) return;

  // Apply the property
  const result: PartialTaskResult = await applyPropertyByType[prop.type]?.(prop, task, action, userInput);
  // store the task's details and save the result
  // Because we recomputed the property in the action context, store the whole thing,
  // rather than just a reference to it
  result.scope[`#${prop.type}`] = prop;
  action.results.push({
    ...result,
    propId: task.propId,
    targetIds: task.targetIds,
  });
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

// When doing a thing, you can only change the queue by pushing an array of ordered props
// to the front of it
// This makes sure that if the queue is full, you finish doing all subtasks in order
// before continuing with other properties in the queue

/**
 * Add the given list of tasks to the front of the queue to be done on the next iteration
 * of the action. You should return result immediately after calling this.
 * @param action 
 * @param tasks 
 */
function doNext(action: Action, tasks: Task[]) {
  action.taskQueue.unshift(...tasks);
}

/**
 * Get all the child tasks of a given property
 * @param action
 * @param prop 
 * @param targetIds 
 * @returns 
 */
async function childTasks(action: Action, prop, targetIds) {
  const tasks: Task[] = [];
  const children = await getPropertyChildren(action.creatureId, prop._id);
  // Push the child tasks and related triggers to the stack
  forEach(children, childProp => {
    tasks.push(...propTasks(childProp, targetIds));
  });
  return tasks
}

/**
 * Get the afterChildren triggers for a given property
 * @param prop 
 * @param targetIds 
 * @returns 
 */
function afterChildrenTriggerTasks(prop, targetIds) {
  const tasks: Task[] = [];
  forEach(prop.triggerIds?.afterChildren, triggerId => {
    tasks.push({ propId: triggerId, targetIds });
  });
  return tasks;
}

/**
 * Get the child and after children tasks for a given property
 * @param action 
 * @param prop 
 * @param targetIds 
 * @returns 
 */
async function childAndTriggerTasks(action, prop, targetIds) {
  return [
    ...await childTasks(action, prop, targetIds),
    ...afterChildrenTriggerTasks(prop, targetIds)
  ]
}

/**
 * Get all the trigger tasks for a given trigger path
 * @param action 
 * @param prop 
 * @param targetIds 
 * @param triggerPath 
 * @returns 
 */
function triggerTasks(action: Action, prop, targetIds: string[], triggerPath: string) {
  const tasks: Task[] = []
  const triggerIds = get(prop?.triggers, triggerPath);
  if (triggerIds) {
    for (const triggerId of triggerIds) {
      tasks.push({ propId: triggerId, targetIds });
    }
  }
  return tasks;
}

/**
 * Get the tasks related to a single property
 * @param prop 
 * @param targetIds 
 * @returns Returns [before triggers, prop, after triggers] tasks
 */
export function propTasks(prop, targetIds?) {
  const tasks: Task[] = [];

  // Push the before triggers
  forEach(prop.triggerIds?.before, triggerId => {
    tasks.push({ propId: triggerId, targetIds });
  });

  // Push the prop task
  tasks.push({ propId: prop._id, targetIds });

  // Push the after triggers
  forEach(prop.triggerIds?.after, triggerId => {
    tasks.push({ propId: triggerId, targetIds });
  });

  return tasks;
}

/**
 * Split a task over its targets, incrementing task step by 1
 * @param task 
 * @param targetIds 
 * @returns Copies of the task, but with a single target each
 */
function perTargetTasks(task: Task, targetIds: string[] = task.targetIds) {
  const tasks: Task[] = [];
  // Keep propId
  const propId = task.propId;
  // Increment step
  const step = (task.step || 0) + 1;

  if (targetIds.length) {
    // If there are targets, apply a new task to each target
    for (const targetId of targetIds) {
      tasks.push({
        propId,
        step,
        targetIds: [targetId],
      });
    }
  } else {
    // Otherwise just do the next step
    tasks.push({
      propId,
      step,
      targetIds,
    });
  }
  return tasks;
}

function createResult(): PartialTaskResult {
  // Add  the property to the action's local scope
  return new PartialTaskResult();
}

// Combine all the action results into the scope at present
export function getEffectiveActionScope(action: Action) {
  const scope = getVariables(action.creatureId);
  // Combine the applied results
  for (const result of action.results) {
    // Pop keys that are not longer used by a busy property
    if (result.popScope) {
      for (const key in result.popScope) {
        if (!result.popScope[key]) continue;
        // If the popped keys have previous results, return to them
        if (scope[key]?.previous) {
          scope[key] = scope[key]?.previous;
        } else {
          // just remove the busy flag, the prop has been consumed
          delete scope[key]?._busy
        }
      }
    }
    // For keys that have just started being used by a busy property
    if (result.pushScope) {
      for (const key in result.pushScope) {
        // If the pushed keys already exist and are busy,
        // save the previous results and overwrite
        // the key
        if (scope[key]?._busy) {
          scope[key] = {
            ...result.pushScope[key],
            previous: scope[key],
            _busy: true,
          };
        } else {
          scope[key] = {
            ...result.pushScope[key],
            _busy: true,
          };
        }
      }
    }
    // Assign other scope changes without bashing the scope[key].previous field
    if (result.scope) {
      for (const key in result.scope) {
        if (scope[key]?.previous || scope[key]?._busy) {
          scope[key] = {
            ...result.scope[key],
            previous: scope[key].previous,
            _busy: scope[key]._busy,
          };
        } else {
          scope[key] = result.scope[key];
        }
      }
    }
  }
  return scope;
}

function doNextStep(action, task) {
  doNext(action, [{
    propId: task.propId,
    targetIds: task.targetIds,
    step: (task.step || 0) + 1,
  }]);
}

const applyPropertyByType = {

  async action(prop, task: Task, action: Action): Promise<PartialTaskResult> {
    const result = createResult();
    const targetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

    // Step 1 Log the name and summary, check that the property has enough resources to fire
    // Then queue step 2
    if (!task.step) {
      const content: LogContent = { name: prop.name };
      if (prop.summary?.text) {
        recalculateInlineCalculations(prop.summary, action);
        content.value = prop.summary.value;
      }
      if (prop.silent) content.silenced = true;
      result.appendLog(content, targetIds);
      // Check Uses
      if (prop.usesLeft <= 0) {
        if (!prop.silent) result.appendLog({
          name: 'Error',
          value: `${prop.name || 'action'} does not have enough uses left`,
        }, targetIds);
        return result;
      }
      // Check Resources
      if (prop.insufficientResources) {
        if (!prop.silent) result.appendLog({
          name: 'Error',
          value: 'This creature doesn\'t have sufficient resources to perform this action',
        }, targetIds);
        return result;
      }
    }
    return result;
  },

  async adjustment(prop, task: Task, action: Action): Promise<PartialTaskResult> {
    const result = createResult();

    const damageTargetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

    const queueChildren = async function () {
      doNext(action, await childAndTriggerTasks(action, prop, damageTargetIds));
    }


    // Step 0, split the task
    if (!task.step) {
      doNext(action, perTargetTasks(task, damageTargetIds));
      return result;
    }

    // Step 1, get the operation and value and push the damage hooks to the queue
    else if (task.step === 1) {

      if (!prop.amount) {
        queueChildren();
        return result;
      }

      // Evaluate the amount
      recalculateCalculation(prop.amount, action, 'reduce');
      const value = +prop.amount.value;
      if (!isFinite(value)) {
        queueChildren();
        return result;
      }

      if (!damageTargetIds?.length) {
        doNextStep(action, task);
        return result;
      }

      if (damageTargetIds.length !== 1) {
        throw 'At this step, only a single target is supported'
      }
      const targetId = damageTargetIds[0];
      const statId = getVariables(targetId)?.[prop.stat]?._propId;
      const stat = statId && getSingleProperty(targetId, statId);
      if (!stat?.type) {
        result.appendLog({
          name: 'Error',
          value: `Could not apply attribute damage, creature does not have \`${prop.stat}\` set`,
          silenced: prop.silent,
        }, damageTargetIds);
        return result;
      }
      // Set the scope properties
      result.pushScope = {};
      if (prop.operation === 'increment') {
        if (value >= 0) {
          result.pushScope['~damage'] = { value };
        } else {
          result.pushScope['~healing'] = { value: -value };
        }
      } else {
        result.pushScope['~set'] = { value };
      }
      // Store which property we're targeting
      if (targetId === action.creatureId) {
        result.pushScope['~attributeDamaged'] = { _propId: stat._id };
      } else {
        result.pushScope['~attributeDamaged'] = stat;
      }
      // Wrap next step in the damage property triggers
      doNext(action, [
        ...triggerTasks(action, stat, damageTargetIds, 'damageProperty.before'),
        {
          propId: task.propId,
          targetIds: damageTargetIds,
          step: 2,
        },
        ...triggerTasks(action, stat, damageTargetIds, 'damageProperty.after'),
      ]);
      return result;
    }

    // Step 2, Apply the damage and Log the results
    else if (task.step === 2) {
      const scope = getEffectiveActionScope(action);
      result.popScope = {
        '~damage': 1, '~healing': 1, '~set': 1, '~attributeDamaged': 1,
      };
      let value = +prop.amount.value;
      if (prop.operation === 'increment') {
        if (value >= 0) {
          value = scope['~damage']?.value;
        } else {
          value = -scope['~healing']?.value;
        }
      } else {
        value = scope['~set']?.value;
      }
      const targetPropId = scope['~attributeDamaged']?._propId;
      if (damageTargetIds?.length) {
        if (damageTargetIds.length !== 1) {
          throw 'At this step, only a single target is supported'
        }
        const targetId = damageTargetIds[0];
        await damageProp(action, { value, operation: prop.operation, targetPropId }, targetId, result)
        result.appendLog({
          name: 'Attribute damage',
          value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
            ` ${value}`,
          inline: true,
          silenced: prop.silent,
        }, [targetId]);
        await queueChildren();
        return result;
      } else {
        result.appendLog({
          name: 'Attribute damage',
          value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
            ` ${value}`,
          inline: true,
          silenced: prop.silent,
        }, damageTargetIds);
        await queueChildren();
        return result;
      }
    }
    return result;
  },

  async branch(prop, task: Task, action: Action, userInput): Promise<PartialTaskResult> {
    const result = createResult();
    const targets = task.targetIds;

    switch (prop.branchType) {
      case 'if': {
        recalculateCalculation(prop.condition, action, 'reduce');
        if (prop.condition?.value) {
          doNext(action, await childAndTriggerTasks(action, prop, targets));
        } else {
          doNext(action, afterChildrenTriggerTasks(action, prop));
        }
        return result;
      }
      case 'index': {
        const children = await getPropertyChildren(action.creatureId, prop._id);
        if (children.length) {
          recalculateCalculation(prop.condition, action, 'reduce');
          if (!isFinite(prop.condition?.value)) {
            result.appendLog({
              name: 'Branch Error',
              value: 'Index did not resolve into a valid number'
            }, targets);
            doNext(action, afterChildrenTriggerTasks(prop, targets));
            return result;
          }
          let index = Math.floor(prop.condition?.value);
          if (index < 1) index = 1;
          if (index > children.length) index = children.length;
          doNext(action, [
            ...propTasks(children[index - 1], targets),
            ...afterChildrenTriggerTasks(prop, targets),
          ]);
          return result;
        }
        doNext(action, afterChildrenTriggerTasks(prop, targets));
        return result;
      }
      case 'hit': {
        const scope = getEffectiveActionScope(action);
        if (scope['~attackHit']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On hit**'
            }, targets);
          }
          doNext(action, await childAndTriggerTasks(action, prop, targets));
        } else {
          doNext(action, afterChildrenTriggerTasks(action, prop));
        }
        return result;
      }
      case 'miss': {
        const scope = getEffectiveActionScope(action);
        if (scope['~attackMiss']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On miss**'
            }, targets);
          }
          doNext(action, await childAndTriggerTasks(action, prop, targets));
        } else {
          doNext(action, afterChildrenTriggerTasks(action, prop));
        }
        return result;
      }
      case 'failedSave': {
        const scope = getEffectiveActionScope(action);
        if (scope['~saveFailed']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On failed save**'
            }, targets);
          }
          doNext(action, await childAndTriggerTasks(action, prop, targets));
        } else {
          doNext(action, afterChildrenTriggerTasks(action, prop));
        }
        return result;
      }
      case 'successfulSave': {
        const scope = getEffectiveActionScope(action);
        if (scope['~saveSucceeded']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On save**'
            }, targets);
          }
          doNext(action, await childAndTriggerTasks(action, prop, targets));
        } else {
          doNext(action, afterChildrenTriggerTasks(action, prop));
        }
        return result;
      }
      case 'random': {
        const children = await getPropertyChildren(action.creatureId, prop._id);
        if (children.length) {
          const index = rollDice(1, children.length)[0] - 1;
          doNext(action, [
            ...propTasks(children[index - 1], targets),
            ...afterChildrenTriggerTasks(prop, targets),
          ]);
        } else {
          doNext(action, afterChildrenTriggerTasks(action, prop));
        }
        return result;
      }
      case 'eachTarget':
        doNext(action, perTargetTasks(task, targets));
        return result;
      case 'choice': {
        // Step 0, halt the action to get user input
        if (!task.step) {
          // Mark the action as needing user input so that it halts
          action.userInputNeeded = pick(prop, ['_id', 'type', 'branchType']);
          // Put this task back in the queue, but at step 1
          doNextStep(action, task);
          return result;
        }
        // Step 1 consume the user input
        else if (task.step === 1) {
          if (!userInput) {
            throw 'User input was required for this step'
          }
          const children = await getPropertyChildren(action.creatureId, prop._id);
          let index = userInput.choice;
          if (!isFinite(index) || index < 0) index = 0;
          if (index > children.length - 1) index = children.length - 1;
          doNext(action, [
            ...propTasks(children[index], targets),
            ...afterChildrenTriggerTasks(prop, targets),
          ]);
          return result;
        }
      }
    }
    return result;
  },

  async note(prop, task: Task, action: Action): Promise<PartialTaskResult> {
    const result = createResult();

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

    doNext(action, await childAndTriggerTasks(action, prop, task.targetIds));
    return result;
  },

}

type DamageProp = {
  operation: 'increment' | 'set';
  value: number;
  targetPropId: string;
}

async function damageProp(action, prop: DamageProp, targetId, result): Promise<void> {
  // fetch the value from the scope after the before triggers, in case they changed them
  const operation = prop.operation;
  const value = prop.value;
  let damage, newValue, increment;
  const targetProp = await getSingleProperty(targetId, prop.targetPropId);
  if (!targetProp) return;
  if (operation === 'set') {
    const total = targetProp.total || 0;
    // Set represents what we want the value to be after damage
    // So we need the actual damage to get to that value
    damage = total - value;
    // Damage can't exceed total value
    if (damage > total && !targetProp.ignoreLowerLimit) damage = total;
    // Damage must be positive
    if (damage < 0 && !targetProp.ignoreUpperLimit) damage = 0;
    newValue = targetProp.total - damage;
    // Write the results
    result.mutations.push({
      targetIds: [targetId],
      updates: [{
        propId: targetProp._id,
        set: { damage, value: newValue },
        type: targetProp.type,
      }],
    });
  } else if (operation === 'increment') {
    const currentValue = targetProp.value || 0;
    const currentDamage = targetProp.damage || 0;
    increment = value;
    // Can't increase damage above the remaining value
    if (increment > currentValue && !targetProp.ignoreLowerLimit) increment = currentValue;
    // Can't decrease damage below zero
    if (-increment > currentDamage && !targetProp.ignoreUpperLimit) increment = -currentDamage;
    damage = currentDamage + increment;
    newValue = targetProp.total - damage;
    // Write the results
    result.mutations.push({
      targetIds: [targetId],
      updates: [{
        propId: targetProp._id,
        inc: { damage: increment, value: -increment },
        type: targetProp.type,
      }],
    });
  }
}

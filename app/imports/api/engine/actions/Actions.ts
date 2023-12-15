import SimpleSchema from 'simpl-schema';
import { forEach, get, isEmpty, pick } from 'lodash';
import LogContentSchema from '/imports/api/creature/log/LogContentSchema';
import { getCreature, getPropertyChildren, getSingleProperty, getVariables } from '/imports/api/engine/loadCreatures';
import recalculateInlineCalculations from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateInlineCalculations';
import recalculateCalculation, { rollAndReduceCalculation } from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateCalculation';
import rollDice from '/imports/parser/rollDice';
import { toString } from '/imports/parser/resolve';
import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';

/* eslint-disable  @typescript-eslint/no-explicit-any */

const Actions = new Mongo.Collection<Action>('actions');

export interface Action {
  _id?: string;
  _isSimulation?: boolean;
  _stepThrough?: boolean;
  creatureId: string;
  rootPropId: string;
  targetIds?: string[];
  results: TaskResult[];
  taskCount: number;
}

type Task = PropTask | DamagePropTask | ItemAsAmmoTask;

interface BaseTask {
  prop: { [key: string]: any };
  targetIds: string[];
}

interface PropTask extends BaseTask {
  subtaskFn?: undefined,
}

class TaskResult {
  propId: string;
  targetIds: string[];
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
  constructor(propId: string, targetIds: string[]) {
    this.propId = propId;
    this.targetIds = targetIds;
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

export const insertAction: ValidatedMethod = new ValidatedMethod({
  name: 'actions.insertAction',
  validate: new SimpleSchema({
    action: ActionSchema
  }).validator({ clean: true }),
  run: async function ({ action }: { action: Action }) {
    assertEditPermission(getCreature(action.creatureId), this.userId);
    // First remove all other actions on this creature
    // only do one action at a time, don't wait for this to finish
    Actions.removeAsync({ creatureId: action.creatureId });
    // Force a random id even if one was provided, we may use it later as the seed for PRNG
    delete action._id;
    return await Actions.insertAsync(action);
  },
});

export const runAction = new ValidatedMethod({
  name: 'actions.runAction',
  validate: new SimpleSchema({
    action: {
      type: Object,
      blackbox: true,
    },
    userInput: {
      type: Object,
      blackbox: true,
      optional: true,
    },
    stepThrough: {
      type: Boolean,
      optional: true,
    }
  }).validator(),
  run: async function ({ actionId, userInput }: { actionId: string, userInput?: any }) {
    const action = await Actions.findOneAsync(actionId);
    if (!action) throw 'Action not found';
    assertEditPermission(getCreature(action.creatureId), this.userId);
    const originalAction = EJSON.clone(action);
    applyAction(action, userInput);
    // Persist changes to the action
    const writePromise = writeChangedAction(originalAction, action);
    return writePromise;
  },
});

// Apply an action
// This is run once as a simulation on the client awaiting all the various inputs or step through
// clicks from the user, then it is run as part of the runAction method, where it is expected to
// complete instantly on the client, and sent to the server as a method call
export async function applyAction(action: Action, userInput?: any, simulate?: boolean, stepThrough?: boolean) {
  if (!Meteor.isClient && simulate) throw 'Cannot simulate on the server';
  if (!Meteor.isClient && stepThrough) throw 'Cannot step through on the server';
  if (Meteor.isClient && !simulate && stepThrough) throw 'Cannot step through on the client without simulating';
  action._stepThrough = stepThrough;
  action._isSimulation = simulate;
  action.taskCount = 0;
  const prop = await getSingleProperty(action.creatureId, action.rootPropId);
  await applyTask(action, {
    prop,
    targetIds: action.targetIds || [],
  }, userInput);
  return { action, userInput };
}

// TODO create a function to get the effective value of a property,
// simulating all the result updates in the action so far

async function applyTask(action: Action, task: Task, userInput?): Promise<void> {
  action.taskCount += 1;
  if (action.taskCount > 100) throw 'Only 100 properties can be applied at once';

  if (task.subtaskFn) {
    const result = new TaskResult(task.prop._id, task.targetIds);
    action.results.push(result);
    switch (task.subtaskFn) {
      case 'damageProp':
        return damageProp(task, action, result, userInput);
      case 'consumeItemAsAmmo':
        return consumeItemAsAmmo(task, action, result, userInput);
    }
  } else {
    // Get property
    const prop = task.prop;

    // Ensure the prop exists
    if (!prop) throw new Meteor.Error('Not found', 'Property could not be found');

    // If the property is deactivated by a toggle, skip it
    if (prop.deactivatedByToggle) return;

    // Before triggers
    if (prop.triggerIds?.before?.length) {
      for (const triggerId of prop.triggerIds.before) {
        const trigger = await getSingleProperty(action.creatureId, triggerId);
        await applyTask(action, { prop: trigger, targetIds: task.targetIds }, userInput);
      }
    }

    // Create a result an push it to the action results, pass it to the apply function to modify
    const result = new TaskResult(task.prop._id, task.targetIds);
    result.scope[`#${prop.type}`] = prop;
    action.results.push(result);

    // Apply the property
    return applyPropertyByType[prop.type]?.(task, action, result, userInput);
  }
}

function writeChangedAction(original: Action, changed: Action) {
  const $set = {};
  for (const key of ActionSchema.objectKeys()) {
    if (!EJSON.equals(original[key], changed[key])) {
      $set[key] = changed[key];
    }
  }
  if (!isEmpty($set) && original._id) {
    return Actions.updateAsync(original._id, { $set });
  }
}

function getPropertyTitle(prop) {
  if (prop.name) return prop.name;
  return getPropertyName(prop.type);
}

/**
 * Get all the child tasks of a given property
 * @param action
 * @param prop 
 * @param targetIds 
 * @returns 
 */
async function applyChildren(action: Action, prop, targetIds, userInput) {
  const children = await getPropertyChildren(action.creatureId, prop);
  // Push the child tasks and related triggers to the stack
  for (const childProp of children) {
    await applyTask(action, { prop: childProp, targetIds }, userInput);
  }
}

/**
 * Get the afterChildren triggers for a given property
 * @param prop 
 * @param targetIds 
 * @returns 
 */
async function applyAfterChildrenTriggers(action: Action, prop, targetIds, userInput) {
  if (!prop.triggerIds?.afterChildren) return;
  for (const triggerId of prop.triggerIds.afterChildren) {
    const trigger = await getSingleProperty(action.creatureId, triggerId);
    await applyTask(action, { prop: trigger, targetIds }, userInput);
  }
}

async function applyAfterTriggers(action: Action, prop, targetIds, userInput) {
  if (!prop.triggerIds?.after) return;
  for (const triggerId of prop.triggerIds.after) {
    const trigger = await getSingleProperty(action.creatureId, triggerId);
    await applyTask(action, { prop: trigger, targetIds }, userInput);
  }
}

/**
 * Applies the following:
 * After triggers
 * Children of the prop
 * After-children triggers
 * @param action 
 * @param prop 
 * @param targetIds 
 * @returns 
 */
async function applyDefaultAfterPropTasks(action: Action, prop, targetIds, userInput) {
  await applyAfterTriggers(action, prop, targetIds, userInput);
  await applyChildren(action, prop, targetIds, userInput);
  await applyAfterChildrenTriggers(action, prop, targetIds, userInput);
}

/**
 * Applies the following:
 * After triggers
 * After-children triggers
 * @param action 
 * @param prop 
 * @param targetIds 
 * @returns 
 */
async function applyAfterTasksSkipChildren(action: Action, prop, targetIds, userInput) {
  await applyAfterTriggers(action, prop, targetIds, userInput);
  await applyAfterChildrenTriggers(action, prop, targetIds, userInput);
}

/**
 * Returns a list of tasks containing the following:
 * After triggers
 * After-children triggers
 * @param action 
 * @param prop 
 * @param targetIds 
 * @returns 
 */
async function applyAfterPropTasksForSingleChild(action: Action, prop, childProp, targetIds, userInput) {
  await applyAfterTriggers(action, prop, targetIds, userInput);
  await applyTask(action, { prop: childProp, targetIds }, userInput);
  await applyAfterChildrenTriggers(action, prop, targetIds, userInput);
}

/**
 * Get all the trigger tasks for a given trigger path
 * @param action 
 * @param prop 
 * @param targetIds 
 * @param triggerPath 
 * @returns 
 */
async function applyTriggers(action: Action, prop, targetIds: string[], triggerPath: string, userInput) {
  const triggerIds = get(prop?.triggers, triggerPath);
  if (!triggerIds) return;
  for (const triggerId of triggerIds) {
    const trigger = await getSingleProperty(action.creatureId, triggerId);
    await applyTask(action, { prop: trigger, targetIds }, userInput);
  }
}

/**
 * Split a task over its targets, incrementing task step by 1
 * @param task 
 * @param targetIds 
 * @returns Copies of the task, but with a single target each
 */
async function applyTaskToEachTarget(action: Action, task: PropTask, targetIds: string[] = task.targetIds, userInput) {
  if (targetIds.length <= 1) throw 'Must have multiple targets to split a task';
  // If there are targets, apply a new task to each target
  for (const targetId of targetIds) {
    await applyTask(action, {
      ...task,
      targetIds: [targetId]
    }, userInput);
  }
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


const applyPropertyByType = {

  async action(task: PropTask, action: Action, result: TaskResult, userInput): Promise<void> {
    const prop = task.prop;
    const targetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

    //Log the name and summary, check that the property has enough resources to fire
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
      return;
    }

    // Check Resources
    if (prop.insufficientResources) {
      if (!prop.silent) result.appendLog({
        name: 'Error',
        value: 'This creature doesn\'t have sufficient resources to perform this action',
      }, targetIds);
      return;
    }

    // Iterate through all the resources consumed and damage them
    if (prop.resources?.attributesConsumed?.length) {
      for (const att of prop.resources.attributesConsumed) {
        const scope = getEffectiveActionScope(action);
        const statToDamage = getFromScope(att.variableName, scope);
        await applyTask(action, {
          prop,
          targetIds: [action.creatureId],
          subtaskFn: 'damageProp',
          params: {
            operation: 'increment',
            value: +att.quantity?.value || 0,
            targetProp: statToDamage,
          },
        }, userInput);
      }
    }

    // Iterate through all the items consumed and consume them
    if (prop.resources?.itemsConsumed?.length) {
      for (const itemConsumed of prop.resources.itemsConsumed) {
        recalculateCalculation(itemConsumed.quantity, action, 'reduce');
        if (!itemConsumed.itemId) {
          throw 'No ammo was selected';
        }
        const item = getSingleProperty(action.creatureId, itemConsumed.itemId);
        if (!item || item.ancestors[0].id !== prop.ancestors[0].id) {
          throw 'The prop\'s ammo was not found on the creature';
        }
        const quantity = +itemConsumed?.quantity?.value;
        if (
          !quantity ||
          !isFinite(quantity)
        ) continue;
        await applyTask(action, {
          prop,
          targetIds,
          subtaskFn: 'consumeItemAsAmmo',
          params: {
            value: quantity,
            item,
          },
        }, userInput);
      }
    }

    // Finish
    return await applyDefaultAfterPropTasks(action, prop, targetIds, userInput);
  },

  async adjustment(task: PropTask, action: Action, result: TaskResult, userInput): Promise<void> {
    const prop = task.prop;
    const damageTargetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

    if (damageTargetIds.length > 1) {
      return await applyTaskToEachTarget(action, task, damageTargetIds, userInput);
    }

    // Get the operation and value and push the damage hooks to the queue
    if (!prop.amount) {
      return;
    }

    // Evaluate the amount
    recalculateCalculation(prop.amount, action, 'reduce');
    const value = +prop.amount.value;
    if (!isFinite(value)) {
      return;
    }

    if (!damageTargetIds?.length) {
      return;
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
      return;
    }

    applyTask(action, {
      prop,
      targetIds: damageTargetIds,
      subtaskFn: 'damageProp',
      params: {
        title: getPropertyTitle(prop),
        operation: prop.operation,
        value,
        targetProp: stat,
      },
    }, userInput);
    return applyDefaultAfterPropTasks(action, prop, damageTargetIds, userInput);
  },

  async branch(task: PropTask, action: Action, result: TaskResult, userInput): Promise<void> {
    const prop = task.prop;
    const targets = task.targetIds;

    switch (prop.branchType) {
      case 'if': {
        await recalculateCalculation(prop.condition, action, 'reduce');
        if (prop.condition?.value) {
          return applyDefaultAfterPropTasks(action, prop, targets, userInput);
        } else {
          return applyAfterTasksSkipChildren(action, prop, targets, userInput);
        }
      }
      case 'index': {
        const children = await getPropertyChildren(action.creatureId, prop);
        if (!children.length) {
          return applyAfterTasksSkipChildren(action, prop, targets, userInput);
        }
        recalculateCalculation(prop.condition, action, 'reduce');
        if (!isFinite(prop.condition?.value)) {
          result.appendLog({
            name: 'Branch Error',
            value: 'Index did not resolve into a valid number'
          }, targets);
          return applyAfterTasksSkipChildren(action, prop, targets, userInput);
        }
        let index = Math.floor(prop.condition?.value);
        if (index < 1) index = 1;
        if (index > children.length) index = children.length;
        const child = children[index - 1];
        return applyAfterPropTasksForSingleChild(action, prop, child, targets, userInput);
      }
      case 'hit': {
        const scope = getEffectiveActionScope(action);
        if (scope['~attackHit']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On hit**'
            }, targets);
          }
          return applyDefaultAfterPropTasks(action, prop, targets, userInput);
        } else {
          return applyAfterTasksSkipChildren(action, prop, targets, userInput);
        }
      }
      case 'miss': {
        const scope = getEffectiveActionScope(action);
        if (scope['~attackMiss']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On miss**'
            }, targets);
          }
          return applyDefaultAfterPropTasks(action, prop, targets, userInput);
        } else {
          return applyAfterTasksSkipChildren(action, prop, targets, userInput);
        }
      }
      case 'failedSave': {
        const scope = getEffectiveActionScope(action);
        if (scope['~saveFailed']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On failed save**'
            }, targets);
          }
          return applyDefaultAfterPropTasks(action, prop, targets, userInput);
        } else {
          return applyAfterTasksSkipChildren(action, prop, targets, userInput);
        }
      }
      case 'successfulSave': {
        const scope = getEffectiveActionScope(action);
        if (scope['~saveSucceeded']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On save**'
            }, targets);
          }
          return applyDefaultAfterPropTasks(action, prop, targets, userInput);
        } else {
          return applyAfterTasksSkipChildren(action, prop, targets, userInput);
        }
      }
      case 'random': {
        const children = await getPropertyChildren(action.creatureId, prop);
        if (children.length) {
          const index = rollDice(1, children.length)[0];
          const child = children[index - 1];
          return applyAfterPropTasksForSingleChild(action, prop, child, targets, userInput);
        } else {
          return applyAfterTasksSkipChildren(action, prop, targets, userInput);
        }
      }
      case 'eachTarget':
        if (targets.length > 1) {
          return applyTaskToEachTarget(action, task, targets, userInput);
        }
        return applyDefaultAfterPropTasks(action, prop, targets, userInput);
      case 'choice': {
        if (action._isSimulation) {
          throw 'Not implemented';
          userInput[prop._id] = {
            choice: await getUserChoice();
          };
        }
        if (!action._isSimulation && !userInput?.[prop._id]) {
          throw 'User input was required for this step'
        }
        const children = await getPropertyChildren(action.creatureId, prop);
        if (!children.length) {
          return applyAfterTasksSkipChildren(action, prop, targets, userInput);
        }
        let index = userInput[prop._id].choice;
        if (!isFinite(index) || index < 0) index = 0;
        if (index > children.length - 1) index = children.length - 1;
        const child = children[index];
        return applyAfterPropTasksForSingleChild(action, prop, child, targets, userInput);
      }
    }
  },

  async folder(task: PropTask, action: Action, userInput): Promise<void> {
    const prop = task.prop;
    return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
  },

  async note(task: PropTask, action: Action, result: TaskResult, userInput): Promise<void> {
    const prop = task.prop;
    let contents: LogContent[] | undefined = undefined;
    const logContent: LogContent = {};
    if (prop.name) logContent.name = prop.name;
    if (prop.summary?.text) {
      await recalculateInlineCalculations(prop.summary, action);
      logContent.value = prop.summary.value;
    }

    if (logContent.name || logContent.value) {
      contents = [logContent];
    }
    // Log description
    if (prop.description?.text) {
      await recalculateInlineCalculations(prop.description, action);
      if (!contents) contents = [];
      contents.push({ value: prop.description.value });
    }
    if (contents) {
      result.mutations.push({
        contents,
        targetIds: task.targetIds,
      });
    }
    return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
  },

  async roll(task: PropTask, action: Action, result: TaskResult, userInput): Promise<void> {
    const prop = task.prop;
    // If there isn't a calculation, just apply the children instead
    if (!prop.roll?.calculation) {
      return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
    }

    const logValue: string[] = [];

    // roll the dice only and store that string
    const {
      rolled, reduced, errors
    } = await rollAndReduceCalculation(prop.roll, action);

    if (rolled.parseType !== 'constant') {
      logValue.push(toString(rolled));
    }
    errors?.forEach(error => {
      result.appendLog({ name: 'Error', value: error.message }, task.targetIds);
    });

    // Store the result
    if (reduced.parseType === 'constant') {
      prop.roll.value = reduced.value;
    } else if (reduced.parseType === 'error') {
      prop.roll.value = null;
    } else {
      prop.roll.value = toString(reduced);
    }

    // If we didn't end up with a constant or a number of finite value, give up
    if (reduced?.parseType !== 'constant' || (reduced.valueType === 'number' && !isFinite(reduced.value))) {
      return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
    }
    const value = reduced.value;

    result.scope[prop.variableName] = { value };
    logValue.push(`**${value}**`);

    result.appendLog({
      name: prop.name,
      value: logValue.join('\n'),
      inline: true,
      silenced: prop.silent,
    }, task.targetIds);

    // Apply children
    return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
  },
}


// Sub tasks

interface DamagePropTask extends BaseTask {
  subtaskFn: 'damageProp';
  params: {
    /**
     * Use getPropertyTitle(prop) to set the title
     */
    title?: string;
    operation: 'increment' | 'set';
    value: number;
    targetProp: any;
  };
}

async function damageProp(task: DamagePropTask, action: Action, result: TaskResult, userInput): Promise<void> {
  const prop = task.prop;

  if (task.targetIds.length > 1) {
    throw 'This subtask can only be called on a single target';
  }
  const targetId = task.targetIds[0];

  let { value } = task.params;
  const { title, operation } = task.params;
  let targetProp = task.params.targetProp;

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
    result.pushScope['~attributeDamaged'] = { _propId: targetProp._id };
  } else {
    result.pushScope['~attributeDamaged'] = targetProp;
  }

  // Run the before triggers which may change scope properties
  await applyTriggers(action, targetProp, [action.creatureId], 'damageProperty.before', userInput);

  // Refetch the scope properties
  const scope = getEffectiveActionScope(action);
  result.popScope = {
    '~damage': 1, '~healing': 1, '~set': 1, '~attributeDamaged': 1,
  };
  value = +value;
  if (operation === 'increment') {
    if (value >= 0) {
      value = scope['~damage']?.value;
    } else {
      value = -scope['~healing']?.value;
    }
  } else {
    value = scope['~set']?.value;
  }
  const targetPropId = scope['~attributeDamaged']?._propId;

  // If there are no targets, just log the result that would apply and end
  if (!task.targetIds?.length) {
    // Get the locally equivalent stat with the same variable name
    const statName = getPropertyTitle(targetProp);
    result.appendLog({
      name: title,
      value: `${statName}${operation === 'set' ? ' set to' : ''}` +
        ` ${value}`,
      inline: true,
      silenced: prop.silent,
    }, task.targetIds);
  }

  let damage, newValue, increment;
  targetProp = await getSingleProperty(targetId, targetPropId);

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
      contents: [{
        name: title,
        value: `${getPropertyTitle(targetProp)} set to ${value}`,
        inline: true,
        silenced: prop.silent,
      }]
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
      contents: [{
        name: 'Attribute damage',
        value: `${getPropertyTitle(targetProp)} ${value}`,
        inline: true,
        silenced: prop.silent,
      }]
    });
  }
  await applyTriggers(action, prop, [action.creatureId], 'damageProperty.after', userInput);
}


interface ItemAsAmmoTask extends BaseTask {
  subtaskFn: 'consumeItemAsAmmo';
  params: {
    value: number;
    item: any;
  };
}

async function consumeItemAsAmmo(task: ItemAsAmmoTask, action: Action, result: TaskResult, userInput): Promise<void> {
  const prop = task.prop;
  let { value, item } = task.params;

  if (item.type !== 'item') throw 'Must use an item as ammo';

  // Store the ammo item and value in the scope
  result.scope[`#ammo`] = { propId: item._id };
  result.pushScope = { ['~ammoConsumed']: { value } };

  // Apply the before triggers
  await applyTriggers(action, item, [action.creatureId], 'ammo.before', userInput);

  // Refetch the scope properties
  const scope = getEffectiveActionScope(action);
  result.popScope = {
    '~ammoConsumed': 1,
  };
  value = scope['~ammoConsumed']?.value || 0;

  const itemChildren = await getPropertyChildren(action.creatureId, item);

  // Do the quantity adjustment
  // Check if property has quantity
  result.mutations.push({
    targetIds: task.targetIds,
    updates: [{
      propId: item._id,
      inc: { quantity: -value },
      type: 'item',
    }],
    // Log the item name as a heading if it has child properties to apply
    contents: itemChildren.length ? [{
      name: getPropertyTitle(item) || 'Ammo',
      inline: false,
      silenced: prop.silent,
    }] : undefined,
  });

  await applyTriggers(action, item, [action.creatureId], 'ammo.after', userInput);
  return applyDefaultAfterPropTasks(action, item, task.targetIds, userInput);
}
